import { Box, Button, Card, CardContent, TextField, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoading, setIsLoggedIn } from "../redux/General";
import axios from "axios";
import MatchHistory from "./MatchHistory";
import { RootState } from "../redux/Store";
import { setProfileData } from "../redux/Profile";
import queryString from "query-string";
import { useLocation } from "react-router-dom";
import Progress from "./Progress";

const Profile = () => {
    const dispatch = useDispatch();
    const { userId } = useSelector((state: RootState) => state.general);
    const { data } = useSelector((state: RootState) => state.profile);
    const { search } = useLocation();
    const profileUserId = queryString.parse(search).userId;

    useEffect(() => {
        getPlayerProfile(profileUserId);
        console.log(data);
    }, []);

    const getPlayerProfile = (userId: any) => {
        dispatch(setIsLoading(true));

        axios.get<any>(`${process.env.REACT_APP_API_URL}/user?userId=${userId}`).then(({ data }) => {
            dispatch(setProfileData(data.payload));
            dispatch(setIsLoading(false));
        });
    }

    const handleLogoutClick = () => {
        localStorage.removeItem("crosscourt_user");
        dispatch(setIsLoggedIn(false));
    }

    return (
        <>
            <Card className="card">
                <CardContent>
                    <Typography
                        variant="h5"
                        gutterBottom
                        className="config-card-header"
                    >
                        {data.Alias}'s Profile
                    </Typography>

                    <TextField 
                        id="txtName" 
                        label="Name" 
                        variant="outlined" 
                        size="small"
                        type="text"
                        value={data.Name} 
                        name="name"
                        disabled
                        fullWidth
                        style={{
                            marginBottom: "15px"
                        }}
                    />

                    <TextField 
                        id="inputAlias" 
                        label="Alias" 
                        variant="outlined" 
                        size="small"
                        type="text" 
                        name="alias"
                        value={data.Alias}
                        fullWidth
                        disabled
                    />
                </CardContent>
            </Card>

            <MatchHistory matchHistory={data.MatchHistory || []} />

            {
                userId === profileUserId
                ? <Box className="config-buttons">
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleLogoutClick}
                    >
                        Log Out
                    </Button>
                </Box>
                : ""
            }
        </>
    );
}

export default Profile;