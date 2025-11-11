// export default new CbordService();
import axios, { AxiosInstance } from "axios";
import { parse } from "node-html-parser";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { DiningHall, DayMenu, MealPeriod, MenuItem } from "../types/dining";

const CBORD_BASE_URL = "https://netnutrition.cbord.com/nn-prod/vucampusdining";

// Hardcoded dining halls with their Cbord unit IDs
export const DINING_HALLS: DiningHall[] = [
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
  private axiosInstance: AxiosInstance;
  private cookieJar: CookieJar;

  constructor() {
    this.cookieJar = new CookieJar();
    // wrap axios to support cookie jar
    this.axiosInstance = wrapper(
      axios.create({
        baseURL: CBORD_BASE_URL,
        headers: {
          // default headers the site expects
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "*/*",
          "X-Requested-With": "XMLHttpRequest",
        },
        // allow the cookie jar and sending cookies across domains
        withCredentials: true,
        // Accept 2xx and 3xx - but throw for >=400
        validateStatus: (s) => s < 400,
        // attach cookie jar to instance (axios-cookiejar-support does this)
        jar: this.cookieJar as any,
      })
    );
  }

  /**
   * Get all dining halls
   */
  async getDiningHalls(): Promise<DiningHall[]> {
    // For now, return the hardcoded list
    // Later you could scrape the main page to get open/closed status
    return DINING_HALLS;
  }

  /**
   * Get menu schedule for a specific dining hall
   */
  async getMenuSchedule(cbordUnitId: number): Promise<DayMenu[]> {
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

      // 2) POST the UnitOId as form-urlencoded (matches browser payload)
      const formBody = new URLSearchParams();
      formBody.append("UnitOId", String(cbordUnitId));

      const res = await this.axiosInstance.post(
        "/Unit/SelectUnitFromUnitsList",
        formBody.toString(),
        {
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
          jar: this.cookieJar as any,
        }
      );

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

      const html = res.data.panels?.find(
        (p: any) => p.id === "menuPanel"
      )?.html;
      if (!html) {
        // log entire panels for debugging
        console.error("menuPanel HTML not found in panels:", res.data.panels);
        return [];
      }

      return this.parseMenuSchedule(html);
    } catch (err) {
      console.error("Error fetching menu schedule:");
      console.error("Error details:", err);

      // If axios error, show response body for debugging
      if (axios.isAxiosError(err)) {
        console.error("Axios response status:", err.response?.status);
        console.error("Axios response data:", err.response?.data);
      }
      throw new Error("Failed to fetch menu data from Cbord");
    }
  }

  /**
   * Parse the HTML to extract menu schedule
   */
  private parseMenuSchedule(html: string): DayMenu[] {
    const root = parse(html);
    const dayMenus: DayMenu[] = [];

    // Find all day sections (cards with dates)
    const daySections = root.querySelectorAll("section.card");

    daySections.forEach((section) => {
      // Get the date from the header
      const dateHeader = section.querySelector(".card-title");
      if (!dateHeader) return;

      const date = dateHeader.text.trim();

      // Get all meal links
      const mealLinks = section.querySelectorAll(".cbo_nn_menuLink");
      const meals: MealPeriod[] = [];

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
  async getMenuItems(menuId: number, cbordUnitId: number): Promise<MenuItem[]> {
    try {
      // First, establish a session by visiting the main page
      await this.axiosInstance.get("/", {
        headers: {
          Referer: `${CBORD_BASE_URL}/`,
          Origin: CBORD_BASE_URL,
        },
      });

      // select unit
      const formBody = new URLSearchParams();
      formBody.append("UnitOId", String(cbordUnitId));

      await this.axiosInstance.post(
        "/Unit/SelectUnitFromUnitsList",
        `UnitOId=${cbordUnitId}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      // Now make the request for menu items
      const response = await this.axiosInstance.post(
        "/Menu/SelectMenu",
        `menuOid=${menuId}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/json, text/javascript, */*; q=0.01",
            Referer: `${CBORD_BASE_URL}/`,
            Origin: CBORD_BASE_URL,
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (!response.data || !response.data.success) {
        console.log("Cbord menu items raw response:", response.data);
        return [];
        //throw new Error("Failed to fetch menu items from Cbord");
      }

      const html = response.data.panels?.find(
        (p: any) => p.id === "itemPanel"
      )?.html;

      if (!html) {
        console.warn(
          "Item panel HTML not found. Full response data:",
          response.data
        );
        return [];
      }

      return this.parseMenuItems(html);
    } catch (error: any) {
      // don't throw here; return null so we can try alternatives

      console.error("Error fetching menu items:", error);
      return [];
    }
  }

  /**
   * Parse the HTML for menu items and normalize into MenuItem[]
   * This function uses node-html-parser (you already imported parse)
   */
  private parseMenuItems(html: string): MenuItem[] {
    const root = parse(html);
    const items: MenuItem[] = [];

    // Find all table rows with menu items
    let itemRows = root.querySelectorAll(
      "tr.cbo_nn_itemPrimaryRow, tr.cbo_nn_itemAlternateRow"
    );

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
      const itemLink = row.querySelector(
        "a.cbo_nn_itemHover, span.cbo_nn_itemHover"
      );
      if (!itemLink) return;

      const name = itemLink.text.trim();

      // Get serving size
      // const servingSizeTd = row.querySelectorAll("td")[2];
      // const servingSize = servingSizeTd?.text.trim() || "";
      const tds = row.querySelectorAll("td");
      const servingSize = tds[2]?.text.trim() || "";

      // Get allergens from images
      const allergenImgs = itemLink.querySelectorAll("img");
      const allergens: string[] = [];
      allergenImgs.forEach((img) => {
        const alt = img.getAttribute("alt");
        if (alt) allergens.push(alt);
      });

      items.push({
        name,
        description: servingSize,
        allergens,
      });
    });

    console.log(`Parsed ${items.length} menu items`);
    return items;
  }
}

export default new CbordService();
