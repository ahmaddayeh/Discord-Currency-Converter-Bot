import axios from "axios";
import fs from "fs/promises";
import "dotenv/config";
import schedule from "node-schedule";

const JSON_FILE_PATH = new URL("../data.json", import.meta.url);
const APIKEY = process.env.API_ACCESS_TOKEN;

console.log("Resolved path:", JSON_FILE_PATH);

const fetchDataAndUpdateJSON = async () => {
  try {
    const response = await axios.get(
      "http://data.fixer.io/api/latest?access_key=" + APIKEY
    );
    const newData = {
      data: response.data,
    };

    await fs.writeFile(JSON_FILE_PATH, JSON.stringify(newData, null, 2));
    console.log("JSON file updated with new data:", newData);
  } catch (error) {
    console.error("Error fetching data or updating JSON file:", error.message);
  }
};

try {
  await fs.access(JSON_FILE_PATH, fs.constants.F_OK);
} catch (error) {
  console.error("JSON file does not exist:", JSON_FILE_PATH);
  process.exit(1);
}

const job = schedule.scheduleJob("0 */2 * * *", async () => {
  console.log("Scheduled job started at:", new Date());
  try {
    await fetchDataAndUpdateJSON();
    console.log("Scheduled job completed at:", new Date());
  } catch (error) {
    console.error("Scheduled job failed:", error.message);
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

export default fetchDataAndUpdateJSON;
