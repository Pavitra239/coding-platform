import {createSlice} from "@reduxjs/toolkit";

const movieSlice = createSlice({
    name:"movie",
    initialState:{
        toggle:false,
    },
    reducers:{
        // actions   
        setToggle:(state)=>{
            state.toggle = !state.toggle;
        },
        
    }
});
export const {setToggle} = movieSlice.actions;
export default movieSlice.reducer;