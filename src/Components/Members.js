import React from "react";
import { Players } from './Players/Players';
import './Styles/Members.css'
import BeerHole from './Styles/Images/beerHole.png';

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
        <div className="login">
            <form className="inputs" onSubmit={handleSubmit}>
                <img src={BeerHole} alt="Pub Games" className="beerhole"/>
                <h3 className="form-control ttl">2023 Heavenly<br/>Pub Golf</h3>
                <div className="form-group">
                    <input type="text" className="form-control nameInput" onChange={handleFirstName} placeholder="Enter First Name" required onKeyUp={(event) => { if (event.key === "Enter") { handleSubmit(event); }}} />
                </div>
                <button className="form-control btnTee" onClick={handleSubmit}>Tee Off!</button>
            </form>
        </div>
    );
};
