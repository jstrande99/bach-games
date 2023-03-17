import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "./Styles/ScoreCard.css";
import { Pubs, Pars, Drinks } from "./Players/Pubs";

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
    const [pubScores, setPubScores] = useState(Pubs.map(() => ""));
    const [penalties, setPenalties] = useState(Pubs.map(() => ""));
    const [leader, setLeader] = useState("");
    const [leaderBoard, setLeaderBoard] = useState([]);
    const [leaderBoardOpen, setLeaderBoardOpen] = useState(false);
    const [total, setTotal] = useState(0);

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
    useEffect(() => {
        updateLeaderBoard();
    }, [total]);
    return (
        <div className="body">
            <h2>Leader: {leader}</h2>
            <div onClick={() => handleLeaderBoard()}>
                <p>Show Leaders</p>
                {leaderBoardOpen && (
                    <div className="leadBoardWapper">
                        <div className="leaderBoardContainer">
                            {leaderBoard?.map((play, index) => (
                                <p key={index}>
                                    {index + 1}. <b>{play.Player}</b> On Hole: {play.CurrentHole} Score of: {play.Total}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="row header">
                <div className="cell1">Hole</div>
                <div className="cell">Drinks</div>
                <div className="cell">Par</div>
                <div className="cell">Score</div>
                <div className="cell">Penalties</div>
            </div>
            {Pubs.map((pub, index) => (
                <div className="row" key={index}>
                    <div className="cell1 pubs">{pub}</div>
                    <div className="cell pubs">{Drinks[index]}</div>
                    <div className="cell pubScore">{Pars[index]}</div>
                    <input
                        className="cell scores"
                        type="number"
                        pattern="[0-9]*"
                        value={pubScores[index] || ""}
                        onChange={(e) => handleEnter(e.target.value, index)}
                        onKeyDown={(e) => {
                            if (Number(e.key)) {
                                handleEnter(e.target.value, index);
                            }
                        }}
                    />
                    <input
                        className="cell scores"
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
                    />
                </div>
            ))}
            <div>Total: {total}</div>
            <h2>Hazards:</h2>
            <li>(+2) Break the seal before hole 2</li>
            <li>(+3) Spill a drink; Yours or anyone elses</li>
            <li>(+5) Miss a hole</li>
            <li>(+2) Unfinished Drink</li>
            <li>(+5) Vomit Comet</li>
            <li>(+6) Refused Service</li>
        </div>
    );
}
