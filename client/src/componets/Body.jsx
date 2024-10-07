// Body.js
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
import Profile from './Profile';

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
    { path: "/problem-form", element: <ProblemForm /> },
    { path: "/problem-form/:id", element: <ProblemForm /> },
    { path: "/problems/:id", element: <ProblemShow /> },
    { path: "/profile", element: <Profile /> },
    {path: "*",element: <NotFoundError/>},
  ]);

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
