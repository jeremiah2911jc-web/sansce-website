/* A consistent architectural pen system: outer contours 1.35, detail 0.8. */
const drawings={
 site:<><path d="M7 10H25V7H41V27H36V41H7Z"/><path d="M12 15H20V24H12ZM28 12H36V21H28ZM12 29H29V36H12Z" strokeWidth=".8"/><path d="M3 44H44M44 4V40M3 40V44M40 44H44M44 4H40" strokeWidth=".8"/><path d="M22 7V4H4V38" strokeDasharray="2 2" strokeWidth=".8"/></>,
 community:<><path d="M5 39V19L14 13L23 19V39M26 39V10L35 5L44 10V39M3 42H45"/><path d="M10 22H14V27H10ZM17 22H20V27H17ZM10 31H14V36H10ZM31 14H35V19H31ZM38 14H41V19H38ZM31 24H35V29H31ZM37 34H41V42" strokeWidth=".8"/><path d="M19 42V35H28V42M23.5 35V42" strokeWidth=".8"/></>,
 document:<><path d="M10 5H30L38 13V43H10ZM30 5V14H38"/><path d="M16 20H32M16 25H32M16 30H25M16 35H23" strokeWidth=".8"/><circle cx="31" cy="35" r="5.5"/><path d="m28 35 2 2 4-4M7 9H5V39H7" strokeWidth=".8"/></>,
 coordination:<><rect x="16" y="5" width="16" height="12" rx="1"/><rect x="3" y="31" width="17" height="12" rx="1"/><rect x="28" y="31" width="17" height="12" rx="1"/><path d="M24 17V24H11.5V31M24 24H36.5V31"/><path d="M21 10H27M8 36H15M33 36H40M21 13H26M8 39H12M33 39H37" strokeWidth=".8"/></>,
 repair:<><path d="M5 25V40H27M7 25L20 14L31 23M14 40V29H22V40"/><path d="m29 36 8-8M32 8a8 8 0 0 0 8 13l-13 13-5 5 4 4 5-5 13-13a8 8 0 0 0-5-12l-1 6-5-1Z" strokeWidth="1.1"/><path d="M8 44H21M11 22V16H15" strokeWidth=".8"/></>,
 time:<><circle cx="24" cy="26" r="16"/><path d="M24 15V26L31 30M18 4H30M24 4V10M36 11L40 7M9 11L6 8"/><path d="M24 12V14M24 38V40M10 26H12M36 26H38" strokeWidth=".8"/></>,
 shield:<><path d="M24 4C30 8 36 10 42 10V25C42 34 33 40 24 45C15 40 6 34 6 25V10C12 10 18 8 24 4Z"/><path d="M24 9C29 12 33 13 37 14V25C37 31 31 36 24 40C17 36 11 31 11 25V14C15 13 19 12 24 9Z" strokeWidth=".8"/><path d="m17 24 5 5 10-11"/>
</>,
 home:<><path d="M5 22L24 6L43 22M10 19V42H38V19M20 42V29H29V42"/><path d="M14 23H18V28H14M31 23H35V28H31M14 34H17M33 34H35M4 45H44M31 11V5H37V16" strokeWidth=".8"/></>
};
export default function SanzeSymbol({kind='document',size=28,...props}){return <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{drawings[kind]||drawings.document}</svg>}
export const SiteSymbol=props=><SanzeSymbol kind="site" {...props}/>;
export const CommunitySymbol=props=><SanzeSymbol kind="community" {...props}/>;
export const DocumentSymbol=props=><SanzeSymbol kind="document" {...props}/>;
export const CoordinationSymbol=props=><SanzeSymbol kind="coordination" {...props}/>;
export const ShieldSymbol=props=><SanzeSymbol kind="shield" {...props}/>;
export const TimeSymbol=props=><SanzeSymbol kind="time" {...props}/>;
export const RepairSymbol=props=><SanzeSymbol kind="repair" {...props}/>;
export const HomeSymbol=props=><SanzeSymbol kind="home" {...props}/>;
