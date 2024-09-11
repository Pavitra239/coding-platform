import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import Login from './Login';
import Browse from './Browse';
import Student from './Student';
import MakeContest from './MakeContest';
import CreateContest from './CreateContest';
import CreateProblem from './CreateProblem';
import MakeProblem from './MakeProblem';


const Body = () => {
    
    const appRouter = createBrowserRouter([
        {
            path: "/",
            element: <Login />
        },
        {
            path: "/browse",
            element: <Browse />
        },
        {
            path:"/student",
            element:<Student/>
        },
        {
            path:"/make-contest",
            element:<MakeContest/>
        },
        {
            path:"/make-problem",
            element:<MakeProblem/>
        },
        {
            path: "/create-contest",
            element: <CreateContest />
        },
        {
            path: "/create-problem",
            element: <CreateProblem />
        },
        
    ])
    return (
        <div>
            <RouterProvider router={appRouter} />
        </div>
    )
}

export default Body