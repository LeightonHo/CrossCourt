import { Box, Button, Card, CardContent, TextField, Typography } from "@material-ui/core";
import CourtForm from "./CourtForm";
import CourtList from "./CourtList";
import PlayerForm from "./PlayerForm";
import PlayerList from "./PlayerList";
import { IState as Props } from "./Main";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useHistory } from "react-router-dom";
import { generateRoundRobin } from "../helpers/RoundRobinGenerator";
import { pushGameState } from "../helpers/SocketHelper";
import { getSocket } from "../helpers/Socket";
import { Alert } from "@material-ui/lab";

export interface IConfig {
    rounds: number,
    winningScore: number,
    courts: string[],
    players: string[]
}

interface IProps {
    config: Props["config"],
    setConfig: React.Dispatch<React.SetStateAction<Props["config"]>>,
    gameState: Props["gameState"],
    sessionId: string
}

const Configuration:React.FC<IProps> = ({ config, setConfig, gameState, sessionId }) => {
    const history = useHistory();
    const socket = getSocket();
    const hasGameStarted: boolean = gameState.length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (!isNaN(parseInt(e.target.value))) {
            setConfig({
                ...config,
                rounds: parseInt(e.target.value)
            });
        }
    }

    const handleStartClick = () => {
        const numberOfPlayers = config.players.length;
        const numberOfCourts = config.courts.length;

        if (numberOfPlayers == 0) {
            console.log(`Please enter at least four players per court.`);
            return;
        }

        if (numberOfCourts == 0) {
            console.log(`Please enter at least one court.`);
            return;
        }

        if (numberOfPlayers - (numberOfCourts * numberOfPlayers) < 0) {
            console.log(`There are not enough players for ${numberOfCourts} courts.`);
            return;
        }

        const roundRobin = generateRoundRobin(config);
        pushGameState(socket, sessionId, config, roundRobin);
        history.push("/round-robin");
    }

    const handleExport = () => {
        const data = `data:text/json;charsett=utf-8,${encodeURIComponent(JSON.stringify(gameState))}`;
        let downloadAnchorElement = document.getElementById("downloadAnchorElement");

        downloadAnchorElement?.setAttribute("href", data);
        downloadAnchorElement?.setAttribute("download", `badminton-export-${new Date().toISOString().split("T")[0]}.json`);
        downloadAnchorElement?.click();
    }

    const renderConfiguration = () => {
        return (
            <>
                <Card className="card">
                    <CardContent className="general-card">
                        <Typography
                            variant="h5"
                        >
                            General
                        </Typography>
                        <TextField
                            id="inputMatches"
                            label={`Rounds (${config.rounds.toString()})`}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            onChange={handleChange}
                            placeholder={config.rounds.toString()}
                            name="name"
                            className="general-input"
                            disabled={hasGameStarted}
                        />
                        <TextField
                            id="inputWinningScore"
                            label={`Winning Score (${config.winningScore.toString()})`}
                            type="number"
                            variant="outlined"
                            size="small"
                            fullWidth
                            onChange={handleChange}
                            placeholder={config.winningScore.toString()}
                            name="name"
                            className="general-input"
                            disabled={hasGameStarted}
                        />
                    </CardContent>
                </Card>

                <Card className="card courts-card">
                    <CardContent>
                        <Typography
                            variant="h5"
                            gutterBottom
                        >
                            Courts ({config.courts.length})
                        </Typography>
                        {
                            !hasGameStarted
                            ? <CourtForm config={config} setConfig={setConfig} />
                            : ""
                        }
                        <CourtList config={config} setConfig={setConfig} hasGameStarted={hasGameStarted} />
                    </CardContent>
                </Card>

                <Card className="card players-card">
                    <CardContent>
                        <Typography
                            variant="h5"
                            gutterBottom
                            className="config-card-header"
                        >
                            Players ({config.players.length})
                        </Typography>
                        {
                            !hasGameStarted
                            ? <PlayerForm config={config} setConfig={setConfig} />
                            : ""
                        }
                        <PlayerList config={config} setConfig={setConfig} hasGameStarted={hasGameStarted} />
                    </CardContent>
                </Card>

                <Box className="config-buttons">
                    {
                        !hasGameStarted
                        ? <>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleStartClick}
                                disabled={hasGameStarted}
                            >
                                Start Session
                            </Button>
                        </>
                        : <>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleExport}
                            >
                                Export data
                            </Button>
                            <a id="downloadAnchorElement"></a>
                        </>
                    }
                </Box>
            </>
        );
    }

    return (
        <>
            {renderConfiguration()}
        </>
    );
}

export default Configuration;