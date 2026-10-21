const models={
 overview:['development-model-v1','規劃高樓位於後側、既有低樓與待開發基地位於前側的建築模型',1254,1254],
 building:['development-model-v1','新舊建物、基地與臨路的建築配置模型',1254,1254],
 land:['agricultural-use-model-v2','農田作物、田埂、灌溉渠道與農路的土地現況模型',1280,853],
 readjustment:['readjustment-district-v2','整體重劃區的多街廓、道路、公園與公共空間鳥瞰模型',1440,1080]
};
export function DevelopmentModel({kind}){
 const [name,alt,width,height]=models[kind]||models.overview;
 return <img className="dev-model-image" src={'/images/land-evaluation/'+name+'.webp'} alt={alt} width={width} height={height} style={{aspectRatio:width+' / '+height}} loading={kind==='overview'?'eager':'lazy'} fetchPriority={kind==='overview'?'high':'auto'} decoding="async"/>;
}
