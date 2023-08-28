"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Classroom {
  // CRUD operations for classrooms

  static async getClassroom(username) {
    const result = await db.query(
      `SELECT classroom_id AS "classroomId",
                          user_username AS "username",
                          seat_alphabetical AS "seatAlphabetical",
                          seat_randomize AS "seatRandomize",
                          seat_male_female AS "seatMaleFemale",
                          seat_high_low AS "seatHighLow",
                          ESE_is_priority AS "eseIsPriority",
                          ELL_is_priority AS "ellIsPriority",
                          fivezerofour_is_priority AS "fiveZeroFourIsPriority",
                          EBD_is_priority AS "ebdIsPriority",
                          seating_config AS "seatingConfig"
                        FROM classrooms
                        WHERE user_username = $1`,
      [username]
    );

    // Check if any rows were returned
    if (result.rows.length === 0) {
      throw new NotFoundError(
        `Classroom configuration for user ${username} does not exist`
      );
    }

    const classroom = result.rows[0];
    return classroom;
  }

  static async createClassroom(username) {
    const duplicateCheck = await db.query(
      `SELECT user_username AS "username"
           FROM classrooms
           WHERE user_username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(
        `Duplicate classroom for user with username ${username}`
      );
    }

    const classroomRes = await db.query(
      `INSERT INTO classrooms
            (user_username,
              seat_alphabetical, 
              seat_randomize,
              seat_male_female,
              seat_high_low,
              ESE_is_priority,
              ELL_is_priority,
              fivezerofour_is_priority,
              EBD_is_priority,
              seating_config)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING user_username AS "username",
                       seat_alphabetical AS "seatAlphabetical",
                       seat_randomize AS "seatRandomize",
                       seat_male_female AS "seatMaleFemale",
                       seat_high_low AS "seatHighLow",
                       ESE_is_priority AS "eseIsPriority",
                       ELL_is_priority AS "ellIsPriority",
                       fivezerofour_is_priority AS "fiveZeroFourIsPriority",
                       EBD_is_priority AS "ebdIsPriority",
                       seating_config AS "seatingConfig"`,
      [
        username,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        "[[null,null,null,null,null,null,null,null,null,null,null, null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null]]",
      ]
    );

    const classroom = classroomRes.rows[0];

    return classroom;
  }

  //Update a particular classroom's particular fields
  static async updateClassroom(classroomId, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      seatAlphabetical: "seat_alphabetical",
      seatRandomize: "seat_randomize",
      seatHighLow: "seat_high_low",
      seatMaleFemale: "seat_male_female",
      eseIsPriority: "ese_is_priority",
      ellIsPriority: "ell_is_priority",
      fiveZeroFourIsPriority: "fivezerofour_is_priority",
      ebdIsPriority: "ebd_is_priority",
      seatingConfig: "seating_config"
    });

    const classromIdVarIdx= "$" + (values.length +1);

    const querySql = `UPDATE classrooms 
                               SET ${setCols} 
                               WHERE classroom_id = ${classromIdVarIdx}
                               RETURNING seat_alphabetical AS "seatAlphabetical",
                                         seat_randomize AS "seatRandomize",
                                         seat_high_low AS "seatHighLow",
                                         seat_male_female AS "seatMaleFemale",
                                         ese_is_priority AS "eseIsPriority",
                                         ell_is_priority AS "ellIsPriority",
                                         fivezerofour_is_priority AS "fiveZeroFourIsPriority",
                                         ebd_is_priority AS "ebdIsPriority",
                                         seating_config AS "seatingConfig"`;

    const result = await db.query(querySql, [...values, classroomId]);
    const classroom = result.rows[0];

    if (!classroom)
      throw new NotFoundError(
        `Classroom with id of ${classroomId} does not exist`
      );

    return classroom;
  }

  //Given a particular classroom, remove it based on its id
  static async deleteClassroom(classroomId) {
    const result = await db.query(
      `DELETE
           FROM classrooms
           WHERE classroom_id = $1
           RETURNING classroom_id AS "classroomId"`,
      [classromId]
    );
    const classroom = result.rows[0];

    if (!classroom)
      throw new NotFoundError(
        `Classroom with id of ${classroomId} does not exist`
      );
  }
}

module.exports = Classroom;
