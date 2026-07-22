import express, { type Request, type Response } from 'express';

// import middleware
import morgan from "morgan";

// import database
import { students } from '@db/db.js';
import { type Student, type Course } from "@libs/types.js";
import {
  zStudentDeleteBody,
  zStudentPostBody,
  zStudentPutBody,
} from "@libs/studentValidator.js";
import { request } from 'node:http';
import { success } from 'zod';

const app = express();
const port = process.env.PORT || 3000;

// use middleware
app.use(morgan("dev", { immediate: false }));
app.use(express.json());    // parses request's payload into 'req.body'

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("API services for Student Data");
});

// GET /students
// get students (by program)
app.get("/students", (req: Request, res: Response) => {
  try {
    const program = req.query.program;
    const studentsID=req.query.studentId;

    if (program && studentsID) {
      let filtered_students = students.filter(
        (student) => student.program === program && student.studentId === studentsID
      );
      return res.json({
        ok: true,
        students: filtered_students,
      });
    } else if(studentsID){
      let filtered_studentsID =students.filter(
        (student) => student.studentId === studentsID
        
      );
      return res.json({
        ok : true,
        students : filtered_studentsID
      })
    }else if(program){
      let filtered_progarm = students.filter(
        (student) => student.program === program
      );
      return res.json({
        ok : true,
        students : filtered_progarm
      })
    }
    else {
      return res.json({
        success: true,
        count: students.length,
        data: students,
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /students, body = {new student data}
// add a new student
app.post("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPostBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = students.find(
      (student) => student.studentId === body.studentId
    );
    if (found) {
      return res.json({
        success: false,
        message: "Student is already exists",
      });
    }

    // add new student
    const new_student = body;
    students.push(new_student);

    // add response header 'Link'
    res.set("Link", `/students/${new_student.studentId}`);

    return res.json({
      success: true,
      data: new_student,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// PUT /students, body = {studentId}
// Update specified student
app.put("/students", (req: Request, res: Response) => {
  try {
    const body = req.body as Student;

    // validate req.body with predefined validator
    const result = zStudentPutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === body.studentId
    );

    if (foundIndex === -1) {
      return res.json({
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    students[foundIndex] = { ...students[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/students/${body.studentId}`);

    return res.json({
      success: true,
      message: `Student ${body.studentId} has been updated successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

// DELETE /students, body = {studentId}
app.delete("/students", (req: Request, res: Response) => {
  try{
    const body = req.body as Student;
    const result = zStudentDeleteBody.safeParse(body);
    if(!result.success){
      return res.status(400).json({
        ok : false,
        message : "Student Id must contain 9 characters",
      })
    }
    const findIndexs = students.findIndex((students:any) => students.studentId === body.studentId)
    if(findIndexs === -1){
      return res.status(404).json({
        ok : false,
        message :"Student ID does not exists",
      })
    }
    students.splice(findIndexs,1);
    return res.json({
      ok : true,
      message : `Student Id ${body.studentId} has been deleted`,
    })
  }catch(err){
    return res.json({
      success : false,
      message : "Something is wrong pls try again",
    })
  }
});

// GET /api/me
app.get("/me",(req: Request,res:Response)=>{
  return res.json({
    ok : true,
    Fullname : "Puntarika Khokanklang",
    studentID : "680610696",
  })
})

app.listen(port, async () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

export default app;