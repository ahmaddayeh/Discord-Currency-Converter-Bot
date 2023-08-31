import { SlashCommandBuilder } from "discord.js";

const list = new SlashCommandBuilder()
  .setName("list-currencies")
  .setDescription("List all currencies available for conversion");

export default list.toJSON();
