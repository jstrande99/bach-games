import React from "react";
import { Players } from './Players/Players';

export default function Members(props) {
    const handleFirstName = (event) => {
        props.setFirstName(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault(); 
        let isPlayer = false;
        if(!props.firstName) {
            alert("Please fill out required fields");
            return;
        }
        Players.forEach((player) => {
            if (props.firstName.toLowerCase() === player.toLowerCase()) {
                props.setName(props.firstName);
                isPlayer = true;
            }
        });
        if(!isPlayer) {
            alert("Not authorized to play");
            return;
        }
    };

    return (
        <div className="login body">
        <form className="inputs" onSubmit={handleSubmit}>
            <div className="form-group">
            <input type="text" className="form-control" onChange={handleFirstName} placeholder="First Name" required onKeyUp={(event) => { if (event.key === "Enter") { handleSubmit(event); }}} />
            <button onClick={handleSubmit}>Enter Game</button>
            </div>
        </form>
        </div>
    );
};
