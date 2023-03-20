import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "./Styles/ScoreCard.css";
import { Pubs, Pars, Drinks } from "./Players/Pubs";
import MapIcon from "./Styles/Images/MapIcon.png";
import Podium from "./Styles/Images/Podium.png";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import L from 'leaflet';

import MarkerIcon1 from './Styles/Images/1marker.png';
import MarkerIcon2 from './Styles/Images/2marker.png';
import MarkerIcon3 from './Styles/Images/3marker.png';
import MarkerIcon4 from './Styles/Images/4marker.png';
import MarkerIcon5 from './Styles/Images/5marker.png';
import MarkerIcon6 from './Styles/Images/6marker.png';
import MarkerIcon7 from './Styles/Images/7marker.png';
import MarkerIcon8 from './Styles/Images/8marker.png';
import MarkerIcon9 from './Styles/Images/9marker.png';
import MarkerIconEnd from './Styles/Images/Endmarker.png';

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
    const [pubScores, setPubScores] = useState(Pubs.map(() => 0));
    const [penalties, setPenalties] = useState(Pubs.map(() => 0));
    const [leader, setLeader] = useState("");
    const [leaderBoard, setLeaderBoard] = useState([]);
    const [leaderBoardOpen, setLeaderBoardOpen] = useState(false);
    const [total, setTotal] = useState(0);

    const [mapOpen, setMapOpen] = useState(false);

    const positions = [38.9608, -119.9415];

    const locations = [
        { position: [38.9591, -119.94272], name: '1: MCPS Taphouse & Grill', icon: MarkerIcon1 },
        { position: [38.9596, -119.9422], name: '2: Sports Bar', icon: MarkerIcon2 },
        { position: [38.9601, -119.943], name: '3: Harvey’s Lake Tahoe casino', icon: MarkerIcon3 },
        { position: [38.9594, -119.94145], name: '4: Hurrah Lake Tahoe', icon: MarkerIcon4 },
        { position: [38.9597, -119.9415], name: '5: Tahoe Club Crawl', icon: MarkerIcon5 },
        { position: [38.9609, -119.9408], name: '6: Peek Night Club', icon: MarkerIcon6 },
        { position: [38.961, -119.9407], name: '7: Lake Tahoe AlewarX', icon: MarkerIcon7 },
        { position: [38.96115, -119.94055], name: '8: Lucky Beaver Bar', icon: MarkerIcon8 },
        { position: [38.96167, -119.9401], name: '9: Dottys Casino', icon: MarkerIcon9 },
        { position: [38.9621, -119.9413], name: 'End: Hard Rock Casino', icon: MarkerIconEnd },
    ];
    const locs = [
        [38.9591, -119.94272],
        [38.9596, -119.9422],
        [38.9601, -119.943],
        [38.9594, -119.94145],
        [38.9597, -119.9415],
        [38.9609, -119.9408],
        [38.961, -119.9407],
        [38.96115, -119.94055],
        [38.96167, -119.9401],
        [38.9621, -119.9413]];

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

    return (
        <div className="body">
            <h2 className="tittleHeader">2023 Heavenly<br/>Pub Golf</h2>
            <div className="nav-links"><img src={MapIcon} alt="Look at map" className="maps" onClick={() => handleMap()}/></div>
            {mapOpen &&
                <div className="leaderBoardContainer">
                    <div>
                        <h1 className="exitBTN mapExit" onClick={() => handleMap()}>&times;</h1>
                        <h3 className="mapTTL">Course Map</h3>
                    </div>
                    <MapContainer center={positions} zoom={16.5} scrollWheelZoom={false} style={{  height: "75vh", width: "80vw"}}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Polyline pathOptions={{ color: 'blue', dashArray: '10, 10' }} positions={locs} />
                        {locations.map((location, index) => (
                            <Marker key={index} position={location.position} icon={L.icon({iconUrl: location.icon, iconSize: [25, 40]})}>
                                <Popup>{location.name}</Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            }
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
            {Pubs.map((pub, index) => (
                <div className="row" key={index}>
                    <div className="cell1 pubs">{pub}</div>
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
