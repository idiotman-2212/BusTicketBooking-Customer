import { http } from "../../utils/http";

const getAll = async () => {
    const resp = await http.get("/reviews/all")
    return resp.data
}

const getPageOfReviews = async (page, limit) => {
    const resp = await http.get("/reviews/paging", {
        params: {
            page: page, // server paging from 0 based index
            limit: limit,
        },
    });
    return resp.data;
}

const getReviewById = async (reviewId) => {
    const resp = await http.get(`/reviews/${reviewId}`)
    return resp.data
}

const getReviewByTripId = async (tripId) => {
    const resp = await http.get(`/reviews/trip/${tripId}`)
    return resp.data
};

const submitReview  = async (newReviews) => {
    const resp = await http.post("/reviews", newReviews)
    return resp.data
}

const getReviewByTripIdAndUsername = async (tripId, username) => {
    const resp = await http.get(`/reviews/check?tripId=${tripId}&username=${username}`);
    return resp.data; 
};

export {
    submitReview , getAll,
    getPageOfReviews, getReviewById, getReviewByTripId,getReviewByTripIdAndUsername
};

