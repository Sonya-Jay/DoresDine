"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DINING_HALLS = void 0;
// export default new CbordService();
const axios_1 = __importDefault(require("axios"));
const node_html_parser_1 = require("node-html-parser");
const axios_cookiejar_support_1 = require("axios-cookiejar-support");
const tough_cookie_1 = require("tough-cookie");
const CBORD_BASE_URL = "https://netnutrition.cbord.com/nn-prod/vucampusdining";
// Hardcoded dining halls with their Cbord unit IDs
exports.DINING_HALLS = [
    { id: 1, name: "Rand Dining Center", cbordUnitId: 1 },
    { id: 2, name: "The Commons Dining Center", cbordUnitId: 2 },
    { id: 3, name: "The Kitchen at Kissam", cbordUnitId: 3 },
    { id: 4, name: "The Pub at Overcup Oak", cbordUnitId: 4 },
    { id: 5, name: "Vandy Blenz", cbordUnitId: 5 },
    { id: 6, name: "Suzie's Food for Thought Cafe", cbordUnitId: 6 },
    { id: 7, name: "Suzie's Blair School of Music", cbordUnitId: 7 },
    { id: 8, name: "Suzie's MRB II", cbordUnitId: 8 },
    { id: 9, name: "Grins Vegetarian Cafe", cbordUnitId: 9 },
    { id: 10, name: "Suzie's Featheringill", cbordUnitId: 10 },
    { id: 11, name: "Holy Smokes Kosher Food Truck", cbordUnitId: 11 },
    { id: 12, name: "E. Bronson Ingram Dining Center", cbordUnitId: 12 },
    { id: 13, name: "Commons Munchie", cbordUnitId: 13 },
    { id: 14, name: "Kissam Munchie", cbordUnitId: 14 },
    { id: 15, name: "Highland Munchie", cbordUnitId: 15 },
    { id: 16, name: "Highland Hotline", cbordUnitId: 16 },
    { id: 17, name: "Local Java Cafe at Alumni", cbordUnitId: 17 },
    { id: 18, name: "Wasabi", cbordUnitId: 18 },
    { id: 19, name: "Zeppos Dining", cbordUnitId: 19 },
    { id: 20, name: "Rothschild Dining Center", cbordUnitId: 20 },
    { id: 21, name: "Cafe Carmichael", cbordUnitId: 21 },
];
class CbordService {
    // private axiosInstance;
    axiosInstance;
    cookieJar;
    constructor() {
        this.cookieJar = new tough_cookie_1.CookieJar();
        // wrap axios to support cookie jar
        this.axiosInstance = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({
            baseURL: CBORD_BASE_URL,
            headers: {
                // default headers the site expects
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                Accept: "*/*",
                "X-Requested-With": "XMLHttpRequest",
            },
            // allow the cookie jar and sending cookies across domains
            withCredentials: true,
            // Accept 2xx and 3xx - but throw for >=400
            validateStatus: (s) => s < 400,
            // attach cookie jar to instance (axios-cookiejar-support does this)
            jar: this.cookieJar,
        }));
    }
    /**
     * Get unit status from Cbord API
     * This method should be updated based on the actual API endpoint you find in the network tab
     *
     * Possible endpoints to check:
     * - GET /Unit/GetUnitsList (or similar)
     * - POST /Unit/GetUnitsList
     * - Check the response from /Unit/SelectUnitFromUnitsList for status info
     *
     * @returns Map of cbordUnitId -> isOpen status
     */
    async getUnitStatusFromAPI() {
        const unitStatusMap = new Map();
        try {
            // TODO: Replace this with the actual endpoint you find in the network tab
            // Example: If you find an endpoint like /Unit/GetUnitsList
            // The endpoint should return unit status information
            // Example structure:
            // const response = await this.axiosInstance.post("/Unit/GetUnitsList", {}, { headers: {...} });
            // Parse response.data to extract unit status
            // For now, return empty map (will fall back to schedule checking)
            return unitStatusMap;
        }
        catch (error) {
            console.error("Error fetching unit status from API:", error);
            return unitStatusMap;
        }
    }
    /**
     * Get all dining halls
     * NOTE: We don't check open/closed status here because it requires making
     * API calls for all 21 halls, which is extremely slow (10+ seconds).
     * Open/closed status can be checked on-demand when viewing a specific hall's schedule.
     */
    async getDiningHalls() {
        // Return all halls without checking status (much faster)
        // Status can be determined when viewing individual hall schedules
        return exports.DINING_HALLS.map(hall => ({ ...hall, isOpen: undefined }));
    }
    /**
     * Get menu schedule for a specific dining hall
     */
    async getMenuSchedule(cbordUnitId) {
        try {
            // 1) initial GET to get cookies + any server-side setup
            // This mirrors the browser loading the page
            await this.axiosInstance.get("/", {
                headers: {
                    // mirror common browser headers; referer/origin sometimes required
                    Referer: `${CBORD_BASE_URL}/`,
                    Origin: CBORD_BASE_URL,
                },
            });
            // 2) Initialize session with local data
            // This ensures the session is properly set up with user preferences
            try {
                const sessionData = new URLSearchParams();
                sessionData.append("localStorageData", JSON.stringify({ showMobileDisc: [false] }));
                await this.axiosInstance.post("/Home/SetSessionFromLocalData", sessionData.toString(), {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        Accept: "*/*",
                        Referer: `${CBORD_BASE_URL}/`,
                        Origin: CBORD_BASE_URL,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                });
            }
            catch (sessionError) {
                // If this fails, continue anyway - it might not be critical
                console.log("Session initialization optional call failed (non-critical):", sessionError);
            }
            // 3) POST the unitOid as form-urlencoded (matches browser payload)
            const formBody = new URLSearchParams();
            formBody.append("unitOid", String(cbordUnitId));
            const res = await this.axiosInstance.post("/Unit/SelectUnitFromUnitsList", formBody.toString(), {
                headers: {
                    // content-type must be application/x-www-form-urlencoded
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Accept: "application/json, text/javascript, */*; q=0.01",
                    Referer: `${CBORD_BASE_URL}/`,
                    Origin: CBORD_BASE_URL,
                    // The site uses X-Requested-With in browser; keep it
                    "X-Requested-With": "XMLHttpRequest",
                },
                // jar + withCredentials are already set on the instance, but safe to include:
                withCredentials: true,
                jar: this.cookieJar,
            });
            // DEBUG: log the top-level response keys if something odd happens
            if (!res || !res.data) {
                console.error("Cbord returned empty response or no data object", {
                    status: res?.status,
                    headers: res?.headers,
                });
                throw new Error("Failed to fetch menu data from Cbord");
            }
            // In the browser you saw { success: true, panels: [...] }
            if (!res.data.success) {
                console.error("Cbord responded with success=false", res.data);
                throw new Error("Failed to fetch menu data from Cbord (success=false)");
            }
            const html = res.data.panels?.find((p) => p.id === "menuPanel")?.html;
            if (!html) {
                // log entire panels for debugging
                console.error("menuPanel HTML not found in panels:", res.data.panels);
                return [];
            }
            return this.parseMenuSchedule(html);
        }
        catch (err) {
            console.error("Error fetching menu schedule:");
            console.error("Error details:", err);
            // If axios error, show response body for debugging
            if (axios_1.default.isAxiosError(err)) {
                console.error("Axios response status:", err.response?.status);
                console.error("Axios response data:", err.response?.data);
            }
            throw new Error("Failed to fetch menu data from Cbord");
        }
    }
    /**
     * Parse the HTML to extract menu schedule
     */
    parseMenuSchedule(html) {
        const root = (0, node_html_parser_1.parse)(html);
        const dayMenus = [];
        // Find all day sections (cards with dates)
        const daySections = root.querySelectorAll("section.card");
        daySections.forEach((section) => {
            // Get the date from the header
            const dateHeader = section.querySelector(".card-title");
            if (!dateHeader)
                return;
            const date = dateHeader.text.trim();
            // Get all meal links
            const mealLinks = section.querySelectorAll(".cbo_nn_menuLink");
            const meals = [];
            mealLinks.forEach((link) => {
                const mealName = link.text.trim();
                // Extract menu ID from onclick="javascript:NetNutrition.UI.menuListSelectMenu(8660973);"
                const onclickAttr = link.getAttribute("onclick");
                const menuIdMatch = onclickAttr?.match(/menuListSelectMenu\((\d+)\)/);
                const menuId = menuIdMatch ? parseInt(menuIdMatch[1]) : 0;
                meals.push({
                    id: menuId,
                    name: mealName,
                    date: date,
                });
            });
            dayMenus.push({
                date,
                meals,
            });
        });
        return dayMenus;
    }
    /**
     * Get detailed menu items for a specific meal/menuId
     * - menuId: the numeric id you parsed from onclick (e.g. menuListSelectMenu(8660973))
     * - tries common endpoints/payload shapes until one returns useful panels/html
     */
    async getMenuItems(menuId, cbordUnitId) {
        try {
            // First, establish a session by visiting the main page
            await this.axiosInstance.get("/", {
                headers: {
                    Referer: `${CBORD_BASE_URL}/`,
                    Origin: CBORD_BASE_URL,
                },
            });
            // Initialize session with local data
            try {
                const sessionData = new URLSearchParams();
                sessionData.append("localStorageData", JSON.stringify({ showMobileDisc: [false] }));
                await this.axiosInstance.post("/Home/SetSessionFromLocalData", sessionData.toString(), {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        Accept: "*/*",
                        Referer: `${CBORD_BASE_URL}/`,
                        Origin: CBORD_BASE_URL,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                });
            }
            catch (sessionError) {
                // If this fails, continue anyway - it might not be critical
                console.log("Session initialization optional call failed (non-critical):", sessionError);
            }
            // select unit
            const formBody = new URLSearchParams();
            formBody.append("unitOid", String(cbordUnitId));
            await this.axiosInstance.post("/Unit/SelectUnitFromUnitsList", formBody.toString(), {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            // Now make the request for menu items
            const response = await this.axiosInstance.post("/Menu/SelectMenu", `menuOid=${menuId}`, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Accept: "application/json, text/javascript, */*; q=0.01",
                    Referer: `${CBORD_BASE_URL}/`,
                    Origin: CBORD_BASE_URL,
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            if (!response.data || !response.data.success) {
                console.log("Cbord menu items raw response:", response.data);
                return [];
                //throw new Error("Failed to fetch menu items from Cbord");
            }
            const html = response.data.panels?.find((p) => p.id === "itemPanel")?.html;
            if (!html) {
                console.warn("Item panel HTML not found. Full response data:", response.data);
                return [];
            }
            return this.parseMenuItems(html);
        }
        catch (error) {
            // don't throw here; return null so we can try alternatives
            console.error("Error fetching menu items:", error);
            return [];
        }
    }
    /**
     * Parse the HTML for menu items and normalize into MenuItem[]
     * This function uses node-html-parser (you already imported parse)
     */
    parseMenuItems(html) {
        const root = (0, node_html_parser_1.parse)(html);
        const items = [];
        // Find all table rows with menu items
        let itemRows = root.querySelectorAll("tr.cbo_nn_itemPrimaryRow, tr.cbo_nn_itemAlternateRow");
        // Fallback: check for div-based item rows (sometimes used in mobile layout)
        if (itemRows.length === 0) {
            console.warn("No table rows found, trying div-based selectors...");
            itemRows = root.querySelectorAll("div.cbo_nn_itemRow");
        }
        if (itemRows.length === 0) {
            console.warn("No menu items found in HTML. Dumping HTML for debugging:");
            console.log(html);
            return [];
        }
        itemRows.forEach((row) => {
            // Get item name from the link
            const itemLink = row.querySelector("a.cbo_nn_itemHover, span.cbo_nn_itemHover");
            if (!itemLink)
                return;
            const name = itemLink.text.trim();
            // Get serving size
            // const servingSizeTd = row.querySelectorAll("td")[2];
            // const servingSize = servingSizeTd?.text.trim() || "";
            const tds = row.querySelectorAll("td");
            const servingSize = tds[2]?.text.trim() || "";
            // Get allergens from images
            const allergenImgs = itemLink.querySelectorAll("img");
            const allergens = [];
            allergenImgs.forEach((img) => {
                const alt = img.getAttribute("alt");
                if (alt)
                    allergens.push(alt);
            });
            // Extract detailOid for fetching nutrition
            // Try multiple methods to find the detailOid:
            // 1. data-detailoid attribute on add button
            // 2. onclick handler on item link
            // 3. id attribute (showNutrition_264361007)
            let detailOid;
            // Method 1: Check add button for data-detailoid
            const addButton = row.querySelector("button[data-detailoid]");
            if (addButton) {
                const detailOidAttr = addButton.getAttribute("data-detailoid");
                if (detailOidAttr) {
                    detailOid = parseInt(detailOidAttr, 10);
                }
            }
            // Method 2: Extract from onclick handler
            if (!detailOid) {
                const onclickAttr = itemLink.getAttribute("onclick");
                if (onclickAttr) {
                    const match = onclickAttr.match(/getItemNutritionLabelOnClick\([^,]+,\s*(\d+)\)/);
                    if (match) {
                        detailOid = parseInt(match[1], 10);
                    }
                }
            }
            // Method 3: Extract from id attribute (showNutrition_264361007)
            if (!detailOid) {
                const idAttr = itemLink.getAttribute("id");
                if (idAttr && idAttr.startsWith("showNutrition_")) {
                    const match = idAttr.match(/showNutrition_(\d+)/);
                    if (match) {
                        detailOid = parseInt(match[1], 10);
                    }
                }
            }
            items.push({
                name,
                description: servingSize,
                allergens,
                detailOid,
            });
        });
        console.log(`Parsed ${items.length} menu items`);
        return items;
    }
    /**
     * Get detailed nutrition information for a specific menu item
     * @param detailOid - The detail ID extracted from menu items HTML
     * @returns Nutrition information or null if not available
     */
    async getItemNutrition(detailOid) {
        try {
            // Ensure we have a session by visiting the main page
            await this.axiosInstance.get("/", {
                headers: {
                    Referer: `${CBORD_BASE_URL}/`,
                    Origin: CBORD_BASE_URL,
                },
            });
            // Initialize session with local data (similar to other endpoints)
            try {
                const sessionData = new URLSearchParams();
                sessionData.append("localStorageData", JSON.stringify({ showMobileDisc: [false] }));
                await this.axiosInstance.post("/Home/SetSessionFromLocalData", sessionData.toString(), {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        Accept: "*/*",
                        Referer: `${CBORD_BASE_URL}/`,
                        Origin: CBORD_BASE_URL,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                });
            }
            catch (sessionError) {
                // If this fails, continue anyway - it might not be critical
                console.log("Session initialization optional call failed (non-critical):", sessionError);
            }
            // Call the nutrition endpoint
            const formBody = new URLSearchParams();
            formBody.append("detailOid", String(detailOid));
            const response = await this.axiosInstance.post("/NutritionDetail/ShowItemNutritionLabel", formBody.toString(), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Accept: "*/*",
                    Referer: `${CBORD_BASE_URL}/`,
                    Origin: CBORD_BASE_URL,
                    "X-Requested-With": "XMLHttpRequest",
                },
            });
            if (!response.data) {
                console.error(`No data returned for nutrition detailOid ${detailOid}`);
                return null;
            }
            // Check if response is HTML (success) or error
            if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE') || response.data.includes('<html')) {
                // Parse the HTML response
                const nutrition = this.parseNutritionLabel(response.data);
                if (!nutrition || !nutrition.calories) {
                    console.error(`Failed to parse nutrition data for detailOid ${detailOid}`);
                    return null;
                }
                return nutrition;
            }
            else {
                console.error(`Unexpected response format for nutrition detailOid ${detailOid}:`, typeof response.data);
                return null;
            }
        }
        catch (error) {
            console.error(`Error fetching nutrition for item ${detailOid}:`, error.message || error);
            return null;
        }
    }
    /**
     * Parse nutrition label HTML to extract nutrition data
     */
    parseNutritionLabel(html) {
        try {
            const root = (0, node_html_parser_1.parse)(html);
            const nutrition = {
                calories: 0,
            };
            // Extract calories (main value) - look for "Calories" followed by number
            const caloriesRow = root.querySelector("td:contains('Calories')");
            if (caloriesRow) {
                const caloriesText = caloriesRow.text;
                const caloriesMatch = caloriesText.match(/Calories[^\d]*(\d+)/i);
                if (caloriesMatch) {
                    nutrition.calories = parseInt(caloriesMatch[1], 10);
                }
            }
            // Extract calories from fat
            const caloriesFromFatMatch = html.match(/Calories from Fat[^\d]*(\d+)/i);
            if (caloriesFromFatMatch) {
                nutrition.caloriesFromFat = parseInt(caloriesFromFatMatch[1], 10);
            }
            // Extract all nutrition values from the HTML text
            // The structure has labels followed by values in spans with class cbo_nn_SecondaryNutrient
            // Total Fat: look for "Total Fat" followed by number and "g"
            const totalFatMatch = html.match(/Total Fat[^<]*<span[^>]*class=['"]cbo_nn_SecondaryNutrient['"][^>]*>(\d+)\s*g/i);
            if (totalFatMatch) {
                nutrition.totalFat = parseInt(totalFatMatch[1], 10);
            }
            // Saturated Fat
            const satFatMatch = html.match(/Saturated Fat[^<]*<span[^>]*class=['"]cbo_nn_SecondaryNutrient['"][^>]*>(\d+)\s*g/i);
            if (satFatMatch) {
                nutrition.saturatedFat = parseInt(satFatMatch[1], 10);
            }
            // Trans Fat
            const transFatMatch = html.match(/Trans Fat[^<]*<span[^>]*class=['"]cbo_nn_SecondaryNutrient['"][^>]*>(\d+)\s*g/i);
            if (transFatMatch) {
                nutrition.transFat = parseInt(transFatMatch[1], 10);
            }
            // Cholesterol
            const cholesterolMatch = html.match(/Cholesterol[^<]*<span[^>]*class=['"]cbo_nn_SecondaryNutrient['"][^>]*>(\d+)\s*mg/i);
            if (cholesterolMatch) {
                nutrition.cholesterol = parseInt(cholesterolMatch[1], 10);
            }
            // Sodium
            const sodiumMatch = html.match(/Sodium[^<]*<span[^>]*class=['"]cbo_nn_SecondaryNutrient['"][^>]*>(\d+)\s*mg/i);
            if (sodiumMatch) {
                nutrition.sodium = parseInt(sodiumMatch[1], 10);
            }
            // Potassium
            const potassiumMatch = html.match(/Potassium[^<]*<span[^>]*class=['"]cbo_nn_SecondaryNutrient['"][^>]*>(\d+)\s*mg/i);
            if (potassiumMatch) {
                nutrition.potassium = parseInt(potassiumMatch[1], 10);
            }
            // Total Carbohydrate
            const carbsMatch = html.match(/Total Carbohydrate[^<]*<span[^>]*class=['"]cbo_nn_SecondaryNutrient['"][^>]*>(\d+)\s*g/i);
            if (carbsMatch) {
                nutrition.totalCarbohydrate = parseInt(carbsMatch[1], 10);
            }
            // Dietary Fiber
            const fiberMatch = html.match(/Dietary Fiber[^<]*<span[^>]*class=['"]cbo_nn_SecondaryNutrient['"][^>]*>(\d+)\s*g/i);
            if (fiberMatch) {
                nutrition.dietaryFiber = parseInt(fiberMatch[1], 10);
            }
            // Sugars
            const sugarsMatch = html.match(/Sugars[^<]*<span[^>]*class=['"]cbo_nn_SecondaryNutrient['"][^>]*>(\d+)\s*g/i);
            if (sugarsMatch) {
                nutrition.sugars = parseInt(sugarsMatch[1], 10);
            }
            // Protein
            const proteinMatch = html.match(/Protein[^<]*<span[^>]*class=['"]cbo_nn_SecondaryNutrient['"][^>]*>(\d+)\s*g/i);
            if (proteinMatch) {
                nutrition.protein = parseInt(proteinMatch[1], 10);
            }
            // Extract vitamins (these are percentages in a separate table)
            const vitaminARow = root.querySelector("td.cbo_nn_SecondaryNutrientLabel:contains('Vitamin A')");
            if (vitaminARow) {
                const nextCell = vitaminARow.nextElementSibling;
                if (nextCell) {
                    const percentText = nextCell.text.trim();
                    const match = percentText.match(/(\d+)%/);
                    if (match) {
                        nutrition.vitaminA = parseInt(match[1], 10);
                    }
                }
            }
            // Extract ingredients
            const ingredientsElement = root.querySelector(".cbo_nn_LabelIngredients");
            if (ingredientsElement) {
                nutrition.ingredients = ingredientsElement.text.trim();
            }
            return nutrition;
        }
        catch (error) {
            console.error("Error parsing nutrition label:", error);
            return null;
        }
    }
}
exports.default = new CbordService();
