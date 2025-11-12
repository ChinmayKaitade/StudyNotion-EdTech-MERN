import { apiConnector } from "../apiConnector";
import { catalogData } from "../apis";

/**
 * Fetches catalog page data for a given categoryId
 * @param {string} categoryId
 * @returns {object} catalog page data or null
 */
export const getCatalogPageData = async (categoryId) => {
  if (!categoryId) {
    console.error("Category ID is required!");
    return null;
  }

  let result = null;

  try {
    // Make POST request to backend
    const response = await apiConnector(
      "POST",
      catalogData.CATALOGPAGEDATA_API,
      { categoryId } // body
    );

    // Check if API returned success
    if (response?.data?.success) {
      console.log("CATALOG PAGE DATA API RESPONSE:", response.data.data);
      result = response.data.data;
    } else {
      console.error(
        "CATALOG PAGE DATA API RESPONSE FAILED:",
        response?.data?.message || "Unknown error"
      );
    }
  } catch (error) {
    // Axios error handling
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error(
        "CATALOG PAGE DATA API ERROR:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // Request was made but no response
      console.error(
        "CATALOG PAGE DATA API ERROR: No response received",
        error.request
      );
    } else {
      // Something else happened
      console.error("CATALOG PAGE DATA API ERROR:", error.message);
    }
  }

  return result;
};
