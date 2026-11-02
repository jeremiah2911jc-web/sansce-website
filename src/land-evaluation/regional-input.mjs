import {defaultRegulatoryReview,newParkingDesign,defaultBasementDemand,newCommercialIntensity} from './generated/core.mjs';

export const regionCode=district=>/新北/.test(district)?'ntpc':/臺北|台北/.test(district)?'taipei':'other';

// Region changes are an input action. The calculation and eligibility functions are unchanged.
export function regionalInputPatch(input,district){
 const previous=input.regulatoryReview,assessment=previous?.bonusAssessment;
 let bonusAssessment;
 if(assessment){
  const applications={...assessment.tdrApplications};
  if(assessment.tdrApplication)applications[assessment.tdrApplication.city]=assessment.tdrApplication;
  const entries={...assessment.entries};
  if(regionCode(district)==='taipei'&&entries['u-public'])entries['u-public']={...entries['u-public'],choice:''};
  bonusAssessment={...assessment,conditions:undefined,renewalQualification:'unknown',dangerQualification:'unknown',tdrQualification:'unknown',source:'',entries,awardBasis:'target',permittedAward:undefined,tdrProfile:'general',tdrApplication:applications[regionCode(district)],tdrApplications:applications};
 }
 return {...(input.commercialIntensity?.enabled?{commercialIntensity:{...newCommercialIntensity(),city:district}}:{}),parkingDesign:newParkingDesign(district,'',Number(input.tdr)>0?'yes':'unknown'),basementDemand:defaultBasementDemand(district),regulatoryReview:{...defaultRegulatoryReview(),...(bonusAssessment?{bonusAssessment}:{})}};
}

export function regionalInputIssues(input,district){
 const issues=[];
 if(input.parkingDesign?.district&&regionCode(input.parkingDesign.district)!==regionCode(district))issues.push('停車條件的地區與評估地區不同，請依評估地區重設條件。');
 if(input.commercialIntensity?.enabled&&input.commercialIntensity.city!==district)issues.push('商業分區所在地與評估地區不同，請依評估地區重設條件。');
 const assessment=input.regulatoryReview?.bonusAssessment;
 if(regionCode(district)==='taipei'&&assessment?.route==='renewal'&&assessment.renewalMode==='detail'&&assessment.entries?.['u-public']?.choice&&assessment.entries['u-public'].status!=='excluded')issues.push('捐贈公益設施的既有細項採用新北市係數，請重設地區條件，並依臺北市個案文件核對獎勵額度。');
 const application=input.regulatoryReview?.bonusAssessment?.tdrApplication;
 if(application&&application.city!==regionCode(district))issues.push('容移資料的地區與評估地區不同，請依評估地區重設條件。');
 return issues;
}
