import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from './Login';
import Browse from './Browse';
import Student from './Student';
import MakeContest from './Contest/MakeContest';
import CreateContest from './Contest/CreateContest';
import MakeProblem from './Problem/MakeProblem';
import ProblemForm from './Problem/ProblemForm';
import ProblemShow from './Problem/ProblemShow';
import NotFoundError from './NotFoundError';
import Contest from './Contest/Contest';
import Profile from './Profile/Profile';
import AdminPage from './Admin/AdminPage';
import Dashboard from './Problem/Dashboard';
import History from './History';
import FacultyPage from './Faculty/FacultyPage';
import StudentRegister from './Faculty/StudentRegister';
import FacultyRegister from './Faculty/FacultyRegister';
import AdminRegister from './Admin/AdminRegister';
import StudentList from './Admin/StudentList';
import AssignProblem from './Problem/AssignProblem';
import AssignedStudents from './Problem/assignedStudents';
import StudentInfo from './Admin/StudentInfo';


const Body = () => {
  const appRouter = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/browse", element: <Browse /> },
    { path: "/student", element: <Student /> },
    { path: "/make-contest", element: <MakeContest /> },
    { path: "/create-contest", element: <CreateContest /> },
    { path: "/create-contest/:id", element: <CreateContest /> },
    { path: "/contests/:id", element: <Contest /> },
    { path: "/make-problem", element: <MakeProblem /> },
    { path: "/pending-requests", element: <AdminPage /> },
    { path: "/faculty-section", element: <FacultyPage /> },
    { path: "/problem-form", element: <ProblemForm /> },
    { path: "/problem-form/:id", element: <ProblemForm /> },
    { path: "/problems/:id", element: <ProblemShow /> },
    { path: "/profile", element: <Profile /> },
    { path: "/dashboard/:problemId", element: <Dashboard /> },
    { path: "/history", element: <History /> },
    { path: "*", element: <NotFoundError /> },
    { path: "/add-student-using-file", element: <StudentRegister /> },
    { path: "/registerStudent", element: <FacultyRegister /> },
    { path: "/registerFaculty", element: <AdminRegister /> },
    { path:"/students/:facultyId", element: <StudentList /> },
    { path:"/assignProblem/:problemId", element: <AssignProblem /> },
    { path:"/assignedStudents/:problemId", element: <AssignedStudents /> },
    { path:"/studentinformation", element: <StudentInfo /> },
  ]);

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;