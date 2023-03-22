import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "./Styles/ScoreCard.css";
import { Pars, Drinks } from "./Players/Pubs";
import MapIcon from "./Styles/Images/MapIcon.png";
import Podium from "./Styles/Images/Podium.png";

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';

const firebaseConfig = {
    apiKey: "AIzaSyAXNMr9rdcFsVqxuYvu0eRr8YqmSZCUO24",
    authDomain: "bachparty-fd9ab.firebaseapp.com",
    projectId: "bachparty-fd9ab",
    storageBucket: "bachparty-fd9ab.appspot.com",
    messagingSenderId: "784821847050",
    appId: "1:784821847050:web:4834747eaa2788999b4bf3",
    measurementId: "G-1PB27WZYHF",
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

export default function ScoreCard(props) {
    const [pubScores, setPubScores] = useState(Array(9).fill(0));
    const [penalties, setPenalties] = useState(Array(9).fill(0));
    const [leader, setLeader] = useState("");
    const [leaderBoard, setLeaderBoard] = useState([]);
    const [leaderBoardOpen, setLeaderBoardOpen] = useState(false);
    const [total, setTotal] = useState(0);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [mapOpen, setMapOpen] = useState(false);
    const [allPubs, setAllPubs] = useState(Array(9).fill(''));
    const [hole, setHole] = useState('');
    const [addies, setAddies] = useState("");

    useEffect(() => {
        const fetchScores = async () => {
            const docRef = firestore
                .collection("Players")
                .doc(props.name.toLowerCase());
            const doc = await docRef.get();
            if (doc.exists) {
                const data = doc.data();
                setPubScores(data.Scores);
                setTotal(data.Total);
                setPenalties(data.Penalties);
            } else {
                await docRef.set({
                    Player: props.name.toLowerCase(),
                    Total: 0,
                    Scores: [],
                    Penalties: [],
                    CurrentHole: 1,
                });
            }
        };
        fetchScores();
        window.scrollTo(0, 0);
    }, [props.name]);

    useEffect(() => {
        const fetchLowestTotal = async () => {
            const querySnapshot = await firestore
                .collection("Players")
                .orderBy("Total")
                .get();
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                setLeader(data.Player);
                setLeaderBoard(querySnapshot.docs.map((doc) => doc.data()));
            }
            let sum = 0;
            pubScores.forEach((score) => {
                sum += Number(score);
            });
            penalties.forEach((pen) => {
                sum += Number(pen);
            });
            setTotal(sum);
            const querySnapshot1 = await firestore
                .collection("Players")
                .where("Player", "==", props.name.toLowerCase())
                .get();

            if (!querySnapshot1.empty) {
                const doc = querySnapshot1.docs[0];
                await doc.ref.update({ Total: sum });
            }
        };
        fetchLowestTotal();
    }, [pubScores, penalties, props.name]);

    const checkNumber = (num) => {
        if (num < 0 || !Number.isInteger(Number(num))) {
            return false;
        }
        return true;
    };

    const handleEnter = (num, index) => {
        if (num !== undefined) {
            let numberCheck = checkNumber(num);
            if (numberCheck) {
                const newPubScores = [...pubScores];
                newPubScores[index] = num;
                setPubScores(newPubScores);
                firestore
                    .collection("Players")
                    .doc(props.name.toLowerCase())
                    .update({ Scores: newPubScores, CurrentHole: index + 1 });
                updateLeaderBoard();
            } else {
                alert("Not valid number");
            }
        }
    };
    const handleEnterPenalties = (num, index) => {
        if (num !== undefined) {
            let numberCheck = checkNumber(num);
            if (numberCheck) {
                const newPenalties = [...penalties];
                newPenalties[index] = num;
                setPenalties(newPenalties);
                firestore
                    .collection("Players")
                    .doc(props.name.toLowerCase())
                    .update({ Penalties: newPenalties });
                updateLeaderBoard();
            } else {
                alert("Not valid number");
            }
        }
    };
    const updateLeaderBoard = async () => {
        const querySnapshot = await firestore
            .collection("Players")
            .orderBy("Total")
            .get();
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            setLeader(data.Player);
            setLeaderBoard(querySnapshot.docs.map((doc) => doc.data()));
        }
    };
    const handleLeaderBoard = () => {
        setLeaderBoardOpen(!leaderBoardOpen);
    };
    const handleMap = () => {
        setMapOpen(!mapOpen);
        console.log(addies)
        window.open(`https://www.google.com/maps/search/?api=1&query=${addies}`)
    };
    useEffect(() => {
        updateLeaderBoard();
    }, [total]);
    const handleClearInputs = async () => {
        const playersRef = firestore.collection("Players");
        const playersSnapshot = await playersRef.get();
        playersSnapshot.forEach(async (doc) => {
            await doc.ref.update({ Scores: Array(10).fill(0), Penalties: Array(10).fill(0), Total: 0, CurrentHole: 1 });
        });
        updateLeaderBoard();
    };
        useEffect(() => {
            const unsubscribe = firestore.collection('Pubs').onSnapshot(snapshot => {
                const pubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllPubs(pubs);
                const addy = snapshot.docs.map(doc => encodeURIComponent(doc.data().Address)).join("+");
                setAddies(addy);
            });
            return unsubscribe;
        }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const pubRef = firestore.collection("Pubs").doc(hole);
        const docs = pubRef.get();
        try {
            if (docs.exists) {
                const data = docs.data();
                console.log(data);
            } else {
                pubRef.set({
                    Name: name,
                    Address: address,
                    Url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
                });
                }
        setName("");
        setAddress("");
        setHole("");
        } catch (error) {
            console.error("Error adding pub: ", error);
        }
    };

    return (
        <div className="body">
            <h2 className="tittleHeader">2023 Heavenly<br/>Pub Golf</h2>
            {props.name.toLowerCase() === 'jordan' && <form onSubmit={handleSubmit}>
                <label>
                    Pub Name:
                    <input type="text" value={name} onChange={(event) => setName(event.target.value)}/>
                </label>
                <label>
                    Hole:
                    <input type="text" value={hole} onChange={(event) => setHole(event.target.value)}/>
                </label>
                <label>
                    Address:
                    <input type="text" value={address} onChange={(event) => setAddress(event.target.value)}/>
                </label>
                <button type="submit">Add Pub</button>
            </form>}
            <div className="nav-links"><img src={MapIcon} alt="Look at map" className="maps" onClick={() => handleMap()}/></div>
            <div>
                <img src={Podium} alt="Leader Board" className="podium" onClick={() => handleLeaderBoard()}/>
                {leaderBoardOpen && (
                    <div className="leadBoardWapper">
                        <div className="leaderBoardContainer">
                            <div className="scoreboardTTL">
                                <h1 className="exitBTN" onClick={() => handleLeaderBoard()}>&times;</h1>
                                <img src={Podium} alt="Leader Board" className="podiumOpenBoard"/>
                                <h2>Scoreboard</h2>
                            </div>
                            <table className="leaderTable">
                                <thead>
                                    <tr>
                                    <th>Name</th>
                                    <th>On Hole</th>
                                    <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderBoard?.map((play, index) => (
                                    <tr key={index}>
                                        <td><b className="player">{play.Player}</b></td>
                                        <td>{play.CurrentHole}</td>
                                        <td>{play.Total}</td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="updateBTN refreshBTN" onClick={() => updateLeaderBoard()}>Refresh Scoreboard</button>
                        </div>
                    </div>
                )}
            </div>
            <div className="row header">
                <div className="cell1">Hole</div>
                <div className="cell">Drinks</div>
                <div className="cell">Par</div>
                <div className="cell">Score</div>
                <div className="cell">Penal</div>
            </div>
            {Object.keys(allPubs).map((pub, index) => (
                <div className="row" key={index}>
                    <div className="cell1 pubs" onClick={() => window.open(allPubs[pub].Url)}>{allPubs[pub].Name}</div>
                    <div className="cell pubs">{Drinks[index]}</div>
                    <div className="cell pubScore">{Pars[index]}</div>
                    <div className="cell"><input
                        className="scores"
                        type="number"
                        pattern="[0-9]*"
                        value={pubScores[index] || ""}
                        onChange={(e) => handleEnter(e.target.value, index)}
                        onKeyDown={(e) => {
                            if (Number(e.key)) {
                                handleEnter(e.target.value, index);
                            }
                        }}
                    /></div>
                    <div className="cell"><input
                        className="scores"
                        type="number"
                        pattern="[0-9]*"
                        value={penalties[index] || ""}
                        onChange={(e) =>
                            handleEnterPenalties(e.target.value, index)
                        }
                        onKeyDown={(e) => {
                            if (Number(e.key)) {
                                handleEnterPenalties(e.target.value, index);
                            }
                        }}
                    /></div>
                </div>
            ))}
            <h2>Current Leader: {leader}</h2>
            <button className="updateBTN" onClick={() => updateLeaderBoard()}>Update Scoreboard</button>
            <div className="rulesHazzards">
                <h5>Rules:</h5>
                <p>Each sip counts as a stroke</p>
                <p>Count your sips to finish your drink</p>
                <p>This is your score for the hole</p>
                <p>Account for any penalties incurred</p>
                <p>Record score and move on to the next hole</p>
                <h5 className="hazzards">Hazards:</h5>
                <p>(+2) Break the seal before hole 2</p>
                <p>(+3) Spill a drink; Yours or anyone elses</p>
                <p>(+5) Miss a hole</p>
                <p>(+2) Unfinished Drink</p>
                <p>(+5) Vomit Comet</p>
                <p>(+6) Refused Service</p>
            </div>
            {props.name.toLowerCase() === 'jordan' && <button onClick={handleClearInputs} className="updateBTN">Clear All Inputs</button>}
            <p>Created by the Strandes</p>
        </div>
    );
}
