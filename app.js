const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/states/", async (request, response) => {
  const getStatesArray = `
    SELECT 
    state_id AS stateId,
    state_name AS stateName,
    population AS population
    FROM 
        state;`;
  const statesArray = await db.all(getStatesArray);
  response.send(statesArray);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.body;
  const getStateDetails = `
    SELECT 
        state_id AS stateId,
        state_name AS stateName,
        population AS population
    FROM 
        state
    WHERE 
        state_id = '${stateId}';`;

  const stateDetails = await db.get(getStateDetails);
  response.send(stateDetails);
});

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `
    INSERT INTO
    district (district_name, state_id, cases, cured, active, deaths)
    VALUES (
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}
    );`;

  await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});
