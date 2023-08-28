"use strict";


const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

//CRUD operations for seating charts
class SeatingChart {
  //Create new seating chart, add
  static async createSeatingChart({ classroomId, number, seatingChart }) {
    const result = await db.query(
      `INSERT INTO seating_charts (classroom_id AS "classroomId",
                                   number
                                   seating_chart AS "seatingChart"
                                   )
           VALUES ($1, $2, $3)
           RETURNING seating_chart_id AS "seatingChartId", classroom_id AS "classroomId", number, seating_chart AS "seatingChart"`,
      [classroomsId, number, seatingChart]
    );

    return result.rows[0];
  }

  // Get all seating charts associated with a particular user
  static async getSeatingCharts(classroomId) {
    const seatingCharts = await db.query(
      `SELECT seating_chart_id AS "seatingChartId",
                        classroom_id AS "classroomId",
                        number,
                        seating_chart AS "seatingChart"
                      FROM seating_charts
                      WHERE classroom_id = $1`, [
        classroomId
      ]
    );
  

    if (!seatingCharts)
      throw new NotFoundError(
        `Seating charts for class with Id of ${classroomId} do not exist`
      );
    return seatingCharts.rows;
  }

  //Given id, get a particular seating chart number
  static async getSeatingChart(seatingChartId) {
    const seatingChart = await db.query(
      `SELECT seating_chart_id AS "seatingChartId",  
                        classroom_id,
                        number,
                        seating_chart AS "seatingChart"
                      FROM seating_charts
                      WHERE seatingChartId = $1`,
      [seatingChartId]
    );

    if (!seatingChart)
      throw new NotFoundError(
        `Seating chart with id of ${seatingChartId} does not exist`
      );

    return seatingChart.rows;
  }

  //Update a particular seating chart based on classroom id and number
  static async updateSeatingChart(seatingChartId, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      number: "number",
      seatingChart: "seating_chart",
    });

    const seatingChartIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE seating_charts 
                              SET ${setCols} 
                              WHERE seating_chart_id = ${seatingChartIdVarIdx},
                              RETURNING seating_chart_id`;

    const result = await db.query(querySql, [...values, seatingChartId]);
    const seatingChart = result.rows[0];

    if (!seatingChart)
      throw new NotFoundError(
        `Seating chart with id of ${seatingChartId} does not exist`
      );

    return seatingChart;
  }

  //Given a particular seating chart, remove it based on its id
  static async deleteSeatingChart(seatingChartId) {
    const result = await db.query(
      `DELETE
           FROM seating_charts
           WHERE classroom_id AS classroom_id = $1, number = $2,
           RETURNING seating_chart_id AS "seatingChartId`,
      [classroomId]
    );
    const seatingChart = result.rows[0];

    if (!seatingChart)
      throw new NotFoundError(
        `Seating chart with id of ${seatingChartId} does not exist`
      );
  }
}

module.exports = SeatingChart;
