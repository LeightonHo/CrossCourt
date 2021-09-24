import React from "react";
import { IState as Props } from "./Main";
import Bye from "./Bye";
import Match from "./Match";
import { Box, Card, CardContent, Divider, Grid, Typography } from "@material-ui/core";

export interface IProps {
    config: Props["config"],
    gameData: Props["gameData"],
    setGameData: React.Dispatch<React.SetStateAction<Props["gameData"]>>
}

export interface IMatch {
    court: string,
    team1: {
        player1: string,
        player2: string,
        score: number
    },
    team2: {
        player3: string,
        player4: string,
        score: number
    }
}

export interface IRound {
    number: number,
    matches: IMatch[],
    byes: Props["config"]["players"]
}

const RoundRobin: React.FC<IProps> = ({ config, gameData, setGameData }) => {

    const initRoundRobin = (): void => {
        // If there is no game data, generate the brackets.
        if (gameData.length === 0) {
            const bracket = generateBracket();

            setGameData([...bracket]);
        }
    }

    let matchKeyList: string[] = [];
    let teamDictionary: { [name: string]: number } = { };
    let playerDictionary: { [name: string]: number } = { };
    let opponentDictionary: { [name: string]: { [name: string]: number } } = { };

    const generateBracket = (): Props["gameData"] => {
        const rounds = config.rounds;
        const bye = config.players.length - (config.courts.length * 4);
        let playersAlreadyOnBye: Props["config"]["players"] = [];
        
        for (const player1 of config.players) {
            // Initialise dictionary for storing available partners.
            playerDictionary[player1] = 0;
            opponentDictionary[player1] = { };

            for (const player2 of config.players) {
                if (player1 === player2) {
                    continue;
                }

                teamDictionary[[player1, player2].sort().toString()] = 0;
                opponentDictionary[player1][player2] = 0;
            }
        }

        for (const team1 of Object.keys(teamDictionary)) {
            for (const team2 of Object.keys(teamDictionary)) {
                if (team1 === team2) {
                    continue;
                }

                const team1List = team1.split(",");
                const team2List = team2.split(",");

                if (!team1List.some(element => team2List.includes(element))) {
                    matchKeyList.push(team1 + ":" + team2);
                }
            }
        }

        console.log(playerDictionary);
        console.log(teamDictionary);

        for (let i = 1; i < rounds + 1; i++)
        {
            // Work out who is on bye this round.
            let currentPlayersOnBye: Props["config"]["players"] = [];
            let eligiblePlayers: Props["config"]["players"] = config.players.filter(x => !playersAlreadyOnBye.includes(x));
            let iterations: number = bye;
    
            // If the number of eligible players is less than the number of byes, then we'll need to take all eligible players and then start the process again.
            if (eligiblePlayers.length <= bye)
            {
                iterations = bye - eligiblePlayers.length;
                currentPlayersOnBye = eligiblePlayers;
                playersAlreadyOnBye = eligiblePlayers;
                eligiblePlayers = config.players.filter(x => !playersAlreadyOnBye.includes(x));
            }

            for (let y = 0; y < iterations; y++)
            {
                let player = eligiblePlayers[eligiblePlayers.length * Math.random() | 0];
                // let player = eligiblePlayers[y];
                let indexOfPlayer = eligiblePlayers.indexOf(player);
    
                currentPlayersOnBye.push(player);
                eligiblePlayers.splice(indexOfPlayer, 1);
            }

            playersAlreadyOnBye = playersAlreadyOnBye.concat(currentPlayersOnBye);

            // Pass list of active players into a function for generating the match up
            let currentPlayers: Props["config"]["players"] = config.players.filter(x => !currentPlayersOnBye.includes(x));

            currentPlayers = shuffleArray(currentPlayers);

            const matches: IMatch[] = generateMatches(config.courts, currentPlayers, currentPlayersOnBye);
            const round: IRound = {
                number: i,
                matches: matches,
                byes: currentPlayersOnBye
            }

            gameData.push(round);
        }

        // for (const log of matchLog) {
        //     console.log(log);
        // }

        // for (const log of teamLog) {
        //     console.log(log);
        // }

        return gameData;
    }

    const shuffleArray = (array: any): any[] => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    let previousMatch = "";

    // Function for rendering each match takes in a list of players and generates the bracket
    const generateMatches = (courts: Props["config"]["courts"], players: Props["config"]["players"], playersOnBye: Props["config"]["players"]): IMatch[] => {
        let result: IMatch[] = []
        let currentPlayers: string[] = [];

        for (let i = 0; i < courts.length; i++) {
            const invalidPlayers = [...currentPlayers, ...playersOnBye];
            let lowestNumberOfGamesPlayedWith = Math.min(...Object.values(teamDictionary));
            let team1: string[] = [];
            let team2: string[] = [];
            let matchFound = false;

            matchKeyList.sort((a, b) => {
                // Sort based on lowest total games played against each other.
                const aTeam1Key = a.split(":")[0];
                const aTeam2Key = a.split(":")[1];
                const aTeam1 = aTeam1Key.split(",");
                const aTeam2 = aTeam2Key.split(",");
                const aPlayer1 = aTeam1[0];
                const aPlayer2 = aTeam1[1];
                const aPlayer3 = aTeam2[0];
                const aPlayer4 = aTeam2[1];
                
                const bTeam1Key = b.split(":")[0];
                const bTeam2Key = b.split(":")[1];
                const bTeam1 = bTeam1Key.split(",");
                const bTeam2 = bTeam2Key.split(",");
                const bPlayer1 = bTeam1[0];
                const bPlayer2 = bTeam1[1];
                const bPlayer3 = bTeam2[0];
                const bPlayer4 = bTeam2[1];

                const aTotal = opponentDictionary[aPlayer1][aPlayer3] + opponentDictionary[aPlayer1][aPlayer4] + opponentDictionary[aPlayer2][aPlayer3] + opponentDictionary[aPlayer2][aPlayer4];
                const bTotal = opponentDictionary[bPlayer1][bPlayer3] + opponentDictionary[bPlayer1][bPlayer4] + opponentDictionary[bPlayer2][bPlayer3] + opponentDictionary[bPlayer2][bPlayer4];

                if (aTotal === bTotal) {
                    // Secondary sort on matches with teams with the lowest number of games played together.
                    return (teamDictionary[aTeam1Key] + teamDictionary[aTeam2Key]) - (teamDictionary[bTeam1Key] + teamDictionary[bTeam2Key])
                }

                return aTotal - bTotal;
            });

            for (const matchKey of matchKeyList) {
                if (matchKey === previousMatch) {
                    continue;
                }

                const team1Key = matchKey.split(":")[0];
                const team2Key = matchKey.split(":")[1];

                team1 = team1Key.split(",");
                team2 = team2Key.split(",");
                const allPlayers = team1.concat(team2);

                // Check that none of these players have already been selected for this round.
                if (allPlayers.some(element => invalidPlayers.includes(element))) {
                    continue;
                }

                // Check that the players have the least number of games played.
                if (teamDictionary[team1Key] > lowestNumberOfGamesPlayedWith || teamDictionary[team2Key] > lowestNumberOfGamesPlayedWith) {
                    continue;
                }
    
                const player1 = team1[0];
                const player2 = team1[1];
                const player3 = team2[0];
                const player4 = team2[1];
    
                // Otherwise add them to the list.
                currentPlayers = currentPlayers.concat(allPlayers);

                // Update team dictionary.
                teamDictionary[team1Key]++;
                teamDictionary[team2Key]++;

                // Update opponent dictionary.
                opponentDictionary[player1][player3]++;
                opponentDictionary[player1][player4]++;

                opponentDictionary[player2][player3]++;
                opponentDictionary[player2][player4]++;

                opponentDictionary[player3][player1]++;
                opponentDictionary[player3][player2]++;

                opponentDictionary[player4][player1]++;
                opponentDictionary[player4][player2]++;

                matchFound = true;

                previousMatch = matchKey;
                break;
            }

            if (matchFound) {
                const match: IMatch = {
                    court: courts[i],
                    team1: {
                        player1: team1[0],
                        player2: team1[1],
                        score: 0
                    },
                    team2: { 
                        player3: team2[0],
                        player4: team2[1],
                        score: 0
                    }
                }
    
                result.push(match);
            }
        }
        
        return result;
    }

    const renderMobileView = () => {
        return (
            <Box>
                {gameData.map((round, roundKey) => {
                    return (
                        <Card 
                            key={roundKey}
                            className="card round-card"
                        >
                            <CardContent>
                                <Grid 
                                    container
                                    direction="column"
                                    className="divRound"
                                    spacing={1}
                                >
                                    <Grid item>
                                        <Typography 
                                            variant="h6"
                                            className="spnGameLabel"
                                            gutterBottom
                                        >
                                            ROUND {round.number}
                                        </Typography>
                                    </Grid>

                                    <Divider />

                                    {round.matches.map((match, matchKey) => {
                                        return (
                                            <Box key={matchKey} className="match-box">
                                                <Grid 
                                                    item xs
                                                    className="match"
                                                >
                                                    <Match match={match} gameData={gameData} setGameData={setGameData} roundKey={roundKey} matchKey={matchKey} />
                                                </Grid>
                                                {addMatchDivider(matchKey, round.matches.length)}
                                            </Box>
                                        );
                                    })}
                                    
                                    <Divider />

                                    <Grid item xs>
                                        <Bye players={round.byes}></Bye>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
        );
    }

    const addMatchDivider = (matchKey: number, totalMatches: number) => {
        if (matchKey !== totalMatches - 1) {
            return (
              <Divider />
            );
        }
    }

    const renderDesktopView = () => {
        return (
            <Box className="games">
                {gameData.map((round, i) => {
                    return (
                        <Grid 
                            key={i}
                            container
                            direction="row"
                            className="divRound"
                            spacing={2}
                        >
                            <Grid item xs={1}>
                                <span className="spnGameLabel">{round.number}</span>
                            </Grid>
                            
                            {round.matches.map((match, j) => {
                                return (
                                    <Grid 
                                        key={j}
                                        item 
                                        xs
                                        className="match"
                                    >
                                        <Match match={match} gameData={gameData} setGameData={setGameData} roundKey={i} matchKey={j} />
                                    </Grid>
                                );
                            })}
                            
                            <Grid item xs={2}>
                                <Bye players={round.byes}></Bye>
                            </Grid>
                        </Grid>
                    );
                })}
            </Box>
        );
    }

    return (
        <Box>
            {initRoundRobin()}
            {renderMobileView()}
        </Box>
    );
}

export default RoundRobin;