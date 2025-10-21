// export default new CbordService();
import axios, { AxiosInstance } from "axios";
import { parse } from "node-html-parser";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { DiningHall, DayMenu, MealPeriod } from "../types/dining";

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
  async getMenuItems(menuId: number) {
    // helper: try a POST and return res.data if success-like, else null
    const tryPost = async (path: string, body: URLSearchParams | string) => {
      try {
        const res = await this.axiosInstance.post(path, body.toString(), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/json, text/javascript, */*; q=0.01",
            Referer: `${CBORD_BASE_URL}/`,
            Origin: CBORD_BASE_URL,
            "X-Requested-With": "XMLHttpRequest",
          },
          withCredentials: true,
          jar: this.cookieJar as any,
        });
        if (res && res.data) return res.data;
        return null;
      } catch (err: any) {
        // don't throw here; return null so we can try alternatives
        console.warn(`POST ${path} failed:`, err?.message || err);
        return null;
      }
    };

    // Ensure we have a session (GET /) so cookies are set
    await this.axiosInstance
      .get("/", {
        headers: { Referer: `${CBORD_BASE_URL}/`, Origin: CBORD_BASE_URL },
      })
      .catch(() => {
        /* ignore; we still try posts */
      });

    // Candidate endpoints + payload shapes observed on similar NetNutrition installs
    const candidates: { path: string; body: URLSearchParams }[] = [
      // most likely
      ((): any => {
        const p = new URLSearchParams();
        p.append("MenuOId", String(menuId)); // some installs use MenuOId
        return { path: "/Menu/SelectMenu", body: p };
      })(),
      ((): any => {
        const p = new URLSearchParams();
        p.append("menuId", String(menuId)); // alternate name
        return { path: "/Menu/SelectMenu", body: p };
      })(),
      ((): any => {
        const p = new URLSearchParams();
        p.append("MenuId", String(menuId)); // capitalized alt
        return { path: "/Menu/SelectMenu", body: p };
      })(),
      // sometimes the site uses a "SelectMenuFromMenuList" variant
      ((): any => {
        const p = new URLSearchParams();
        p.append("MenuOId", String(menuId));
        return { path: "/Menu/SelectMenuFromMenuList", body: p };
      })(),
    ];

    let data: any | null = null;
    for (const c of candidates) {
      data = await tryPost(c.path, c.body);
      if (
        data &&
        (data.success || Array.isArray(data.panels) || typeof data === "object")
      ) {
        // plausible response — stop trying further endpoints
        break;
      }
    }

    if (!data) {
      throw new Error(
        "Failed to fetch menu items from Cbord (no candidate returned data)"
      );
    }

    // If response returns panels (like earlier), find the panel that contains items
    const panels = data.panels ?? [];
    const itemsHtml =
      panels.find((p: any) => p.id === "itemPanel")?.html ||
      panels.find((p: any) => p.id === "coursesPanel")?.html ||
      panels.find((p: any) => p.id === "menuItemsPanel")?.html ||
      panels.map((p: any) => p.html).join("\n"); // fallback: concat all html

    if (!itemsHtml) {
      // If it returned a different shape, return raw data for debugging
      console.warn(
        "Menu items panel not found. Returning raw data for inspection.",
        { data }
      );
      return { raw: data };
    }

    // Parse the items HTML into structured items
    const parsedItems = this.parseMenuItems(itemsHtml);
    return parsedItems;
  }

  /**
   * Parse the HTML for menu items and normalize into MenuItem[]
   * This function uses node-html-parser (you already imported parse)
   */
  private parseMenuItems(html: string) {
    const root = parse(html);
    const items: any[] = [];

    // Typical patterns:
    // - Each menu item may be in an element with class .menuItem or .cbo_nn_menuItem
    // - Stations may be headings like <h4 class="station"> or .course-title
    // - Some menus group items under .list-group .list-group-item
    // We'll try a few heuristics:

    // 1) direct item nodes
    const directItems = root.querySelectorAll(
      ".menuItem, .cbo_nn_menuItem, .cbo_nn_item, .list-group-item"
    );
    if (directItems.length > 0) {
      directItems.forEach((node) => {
        const nameNode =
          node.querySelector(".menuItem__name, .item-name, .cbo_nn_itemName") ||
          node.querySelector("h5, h4, .mb-0");
        const descNode = node.querySelector(
          ".menuItem__desc, .item-desc, .cbo_nn_itemDescription, p"
        );
        const caloriesNode = node.querySelector(".calories, .cbo_nn_calories");

        items.push({
          id: node.getAttribute("data-id") || undefined,
          name:
            nameNode?.text?.trim() ||
            node.text?.trim()?.split("\n")?.[0] ||
            null,
          description: descNode?.text?.trim() || null,
          station:
            node
              .closest(".course, .station, .cbo_nn_course")
              ?.querySelector("h4, .course-title")
              ?.text?.trim() || null,
          calories: caloriesNode
            ? parseInt(caloriesNode.text.replace(/\D/g, ""), 10)
            : undefined,
        });
      });

      return items;
    }

    // 2) look for stations/courses, and inside each, list items
    const courseSections = root.querySelectorAll(
      ".course, .cbo_nn_course, .station-group, .cbo_nn_station"
    );
    if (courseSections.length > 0) {
      courseSections.forEach((course) => {
        const stationName =
          course
            .querySelector("h4, .course-title, .station-title")
            ?.text?.trim() || null;
        const nodeItems = course.querySelectorAll(
          "li, .cbo_nn_item, .menuItem"
        );
        nodeItems.forEach((ni) => {
          items.push({
            id: ni.getAttribute("data-id") || undefined,
            name:
              ni.querySelector(".item-name, h5, span")?.text?.trim() ||
              ni.text?.trim() ||
              null,
            description:
              ni.querySelector(".item-desc, p")?.text?.trim() || null,
            station: stationName,
          });
        });
      });
      return items;
    }

    // 3) fallback: attempt to extract lines that look like "Item — description" or list lines
    const textLines = root.text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    // Heuristic: lines with " - " or " — " or ":" may be item + desc
    for (const line of textLines) {
      if (line.length < 2) continue;
      // simple: if line has more than 3 words and not an obvious header, treat as item
      if (line.split(" ").length > 2) {
        items.push({ id: undefined, name: line, description: null });
      }
    }

    return items;
  }
}

export default new CbordService();
