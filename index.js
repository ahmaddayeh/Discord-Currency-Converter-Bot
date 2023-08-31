import "dotenv/config";
import fs from "fs/promises";
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes as SlashRoutes } from "discord-api-types/v9";
import convertCommand from "./commands/convert.js";
import listCommand from "./commands/list.js";
import fetchDataAndUpdateJSON from "./modules/scheduler.js";

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const logoImagePath =
  "https://cdn.discordapp.com/avatars/1146740601723826186/fd1e263c5ea3976e0738269f7d01e62c.webp?size=80";

async function convert(interaction) {
  await interaction.deferReply();
  const inputAmount = interaction.options.getInteger("amount");
  const inputCurr = interaction.options.getString("from").toLocaleUpperCase();
  const outputCurr = interaction.options.getString("to").toLocaleUpperCase();

  try {
    const jsonData = await fs.readFile("data.json", "utf8");
    const data = JSON.parse(jsonData);

    const timestamp = data.timestamp;
    const date = new Date(timestamp * 1000); // Convert to milliseconds

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
      timeZone: "UTC",
    };
    const formattedDate = date.toLocaleString("en-US", options);

    const inputToEurRate = data.data.rates[inputCurr];
    const conversionRate = data.data.rates[outputCurr];

    if (inputToEurRate === undefined || conversionRate === undefined) {
      await interaction.editReply(
        "Please check your input currency and try again"
      );
      return;
    }

    const eurAmount =
      inputCurr !== "EUR" ? inputAmount / inputToEurRate : inputAmount;
    const convertedAmount = eurAmount * conversionRate;

    const formattedConvertedAmount = convertedAmount.toLocaleString("en-US");

    console.log(formattedConvertedAmount);

    const embd = new EmbedBuilder()
      .setTitle("**Currency Conversion**")
      .setDescription(
        `${inputAmount} ${inputCurr} = ${formattedConvertedAmount} ${outputCurr}`
      )

      .setColor(0x0d2c99)
      .setFooter({
        text: "Currency Converter • last updated: " + formattedDate,
        iconURL: logoImagePath,
      });
    await interaction.editReply({ embeds: [embd] });
  } catch (error) {
    console.error("Error:", error);
    await interaction.editReply(
      "An error occurred while reading or processing data."
    );
  }
}

async function list(interaction) {
  await interaction.deferReply();
  try {
    const jsonData = await fs.readFile("currencies.json", "utf8");
    const parsedData = JSON.parse(jsonData);

    let description = "``` ";
    for (const currencyCode in parsedData) {
      const currencyDescription = parsedData[currencyCode];
      description += `${currencyCode}: ${currencyDescription}\n`;
    }
    description += "``` ";

    const formattedDate = new Date().toLocaleDateString();

    const embd = new EmbedBuilder()
      .setTitle("**Currency Conversion**")
      .setDescription(description)
      .setColor(0x0d2c99)
      .setFooter({
        text: "Currency Converter • last updated: " + formattedDate,
        iconURL:
          "https://cdn.discordapp.com/avatars/1146740601723826186/fd1e263c5ea3976e0738269f7d01e62c.webp?size=80",
      });

    await interaction.editReply({ embeds: [embd] });
  } catch (error) {
    console.error("Error:", error);
    await interaction.editReply(
      "An error occurred while reading or processing data."
    );
  }
}

async function registerCommands() {
  const commands = [convertCommand, listCommand];

  try {
    const rest = new REST({ version: "10" }).setToken(TOKEN);
    await rest.put(SlashRoutes.applicationCommands(CLIENT_ID), {
      body: commands,
    });
    console.log("Successfully registered commands!");
  } catch (error) {
    console.error("Error registering commands:", error);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Bot is ready!");
  client.user.setStatus("online");
  client.user.setActivity("Currencies Exchange Rate", {
    type: ActivityType.Watching,
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "convert-currency") {
    await convert(interaction);
  }
  if (interaction.commandName === "list-currencies") {
    await list(interaction);
  }
});

async function startBot() {
  try {
    await client.login(TOKEN);
    await registerCommands();
    fetchDataAndUpdateJSON();
  } catch (error) {
    console.error("Error starting the bot:", error);
  }
}

startBot();
