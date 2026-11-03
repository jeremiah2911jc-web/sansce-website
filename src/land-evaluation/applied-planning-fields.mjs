import {bonusInputVisible} from './collective-notes.mjs';

// Select only inputs used by the active model; stored alternatives stay intact.
export function planningFieldApplied(input,key){
 if(!bonusInputVisible(input,key))return false;
 if(input.quantityReserve&&['equipment','lobby','roofRate','reserve'].includes(key))return false;
 if(input.basementDemand?.enabled&&['excavation','excavationCap','basementFloors','reserve','quantity.basementReservePercent'].includes(key))return false;
 if(key==='basementFloors'&&input.basementMode==='auto')return false;
 if(key==='quantity.basementReservePercent'&&input.quantityReserve?.basementEquipmentMode==='named')return false;
 if(input.parkingDesign&&['carPerUnit','carPing','motoSqm','localParkingUnit'].includes(key))return false;
 if(key==='localParkingUnit'&&input.parkingRule!=='localUnit')return false;
 return true;
}
