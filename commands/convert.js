import { SlashCommandBuilder } from "discord.js";

const route = new SlashCommandBuilder()
  .setName("convert-currency")
  .setDescription(
    "Convert one currency to another using the latest live exchange rates"
  )
  .addIntegerOption((option) =>
    option
      .setName("amount")
      .setDescription("Insert Amount in Number")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("from")
      .setDescription("Insert original currency")
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(3)
  )
  .addStringOption((option) =>
    option
      .setName("to")
      .setDescription("Insert Output Currency")
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(3)
  );

export default route.toJSON();
