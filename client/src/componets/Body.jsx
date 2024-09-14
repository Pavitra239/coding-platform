// Body.js
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from './Login';
import Browse from './Browse';
import Student from './Student';
import MakeContest from './MakeContest';
import CreateContest from './CreateContest';
import MakeProblem from './MakeProblem';
import ProblemForm from './ProblemForm';
import ProblemShow from './ProblemShow';

const Body = () => {
  const appRouter = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/browse", element: <Browse /> },
    { path: "/student", element: <Student /> },
    { path: "/make-contest", element: <MakeContest /> },
    { path: "/make-problem", element: <MakeProblem /> },
    { path: "/create-contest", element: <CreateContest /> },
    { path: "/problem-form", element: <ProblemForm /> },
    { path: "/problem-form/:id", element: <ProblemForm /> },
    { path: "/problems/:id", element: <ProblemShow /> }
  ]);

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
