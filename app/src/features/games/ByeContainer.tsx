import { Box, Grid } from "@material-ui/core";
import React from "react";
import { IPlayer } from "../../types";
import Bye from "./Bye";

interface IProps {
    players: IPlayer[],
    roundKey: number
}

const ByeContainer: React.FC<IProps> = ({ players, roundKey }) => {
    const renderByes = () => {
        return (players.map((player, key) => {
            return (
                <Bye 
                    key={key}
                    byeKey={key}
                    player={player} 
                    roundKey={roundKey}
                />
            )
        }));
    }

    return (
        <Grid item xs>
            <Box style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-evenly"
            }}>
                {renderByes()}
            </Box>
        </Grid>
    );
}

export default ByeContainer;