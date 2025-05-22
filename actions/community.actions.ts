import { Community, CommunitySchema } from "@/models/community.model";
import axiosInstance from "@/utils/axiosInstance";
import { z } from "zod";

export const getCommunityById = async (id: number): Promise<Community | undefined> => {
    try {

        const response = await axiosInstance.get(`/communities/${id}`);

        const community = CommunitySchema.parse(response.data);

        console.log("Fetched events successfully:", community);
        return community;
    } catch (error) {
        console.log("Error fetching community:", error);
    }
};

export const getCommunities = async (): Promise<Community[] | undefined> => {
    try {

        const response = await axiosInstance.get(`/communities/me/community/`);

        const communities = z.array(CommunitySchema).parse(response.data.results);

        return communities;
    } catch (error) {
        console.log("Error fetching community:", error);
    }
};