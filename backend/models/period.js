"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

//CRUD operations for period
class Period {
  //Check if period has been created already for that school year; if not, add to db
  static async createPeriod({ username, schoolYear, title, number }) {
    const duplicateCheck = await db.query(
      `SELECT user_username AS "username",
              school_year AS "schoolYear",
              title,
              number
              FROM periods
              WHERE user_username = $1 
              AND number = $2`,
      [username, number]
    );

    if (duplicateCheck.rows[0]){
      throw new BadRequestError(
        `Duplicate period: Year of ${schoolYear} Period ${number}: ${title}`
      );
    };
    
    const result = await db.query(
      `INSERT INTO periods
           (user_username, school_year, title, number)
           VALUES ($1, $2, $3, $4)
           RETURNING period_id AS "periodId", user_username AS "username", school_year AS "schoolYear", title, number`,
      [username, schoolYear, title, number]
    );
    
    const period = result.rows[0];

    return period;
  }

  //Get all periods from that user
  static async getPeriods(username) {
    const periodRes = await db.query(
      `SELECT period_id AS "periodId",
                  user_username AS "username",
                  school_year AS "schoolYear",
                  title,
                  number
                  FROM periods
                  WHERE user_username = $1`,
      [username]
    );
    const periods = periodRes.rows;

    if (!periods) {
      throw new NotFoundError(`No periods yet`);
    }

    return periods;
  }

  //Retrieve all students in a given period
  static async getPeriod(periodId) {
    const period = await db.query(
      `SELECT s.student_id AS "studentId",
                        s.period_id AS "periodId",
                        s.name,
                        s.grade,
                        s.gender,
                        s.is_ESE,
                        s.has_504,
                        s.is_ELL,
                        s.is_EBD
                      FROM students AS s
                      WHERE s.period_id = $1
                      ORDER BY name`,
      [periodId]
    );

    if (!period) throw new NotFoundError(`No students in this period`);

    return period.rows;
  }

  //Update school year, period, title
  static async updatePeriod(periodId, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      periodId: "period_id",
      schoolYear: "school_year",
      title: "title",
      number: "number",
    });
    const periodVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE periods 
                      SET ${setCols} 
                      WHERE period_id = ${periodVarIdx} 
                      RETURNING period_id AS "periodId", 
                                school_year AS "schoolYear", 
                                title, 
                                number`;
    const result = await db.query(querySql, [...values, periodId]);
    const period = result.rows[0];

    if (!period)
      throw new NotFoundError(`No period: Period ${number}, ${title}`);

    return period;
  }

  //Remove a particular period by id
  static async deletePeriod(periodId) {
    const result = await db.query(
      `DELETE
           FROM periods
           WHERE period_id = $1
           RETURNING period_id AS "periodId"`,
      [periodId]
    );
    const periods = result.rows[0];

    if (!periods) throw new NotFoundError(`No period: ${periodId}`);
  }
}

module.exports = Period;
