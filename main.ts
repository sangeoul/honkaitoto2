const KEVIN=1;
const ELYSIA=2;
const APONIA=3;
const EDEN=4;
const VILLV=5;
const KALPAS=6;
const SU=7;
const SAKURA=8;
const KOSMA=9;
const MOBIUS=10;
const GRISEO=11;
const HUA=12;
const PARDO=13;
const MEI=14;

var WRITELOG=false;


var SIMULATING_NUMBER=1;
if(SIMULATING_NUMBER==1){
    WRITELOG=true;
}


//const PLAYER1=KOSMA;
//const PLAYER2=APONIA;







const DMG_PHY=0;
const DMG_ELE=1;


const DEBUFFNUMBER=10;
const DEBUFF_DISC=0;
const DEBUFF_CONF=1;
const DEBUFF_SILE=2;
const DEBUFF_WEAK=3;
const DEBUFF_HAZY=4;
const DEBUFF_CORR=5;
const DEBUFF_EXHA=6;
const DEBUFF_EXEC=7;
const DEBUFF_RUPT=8;
const DEBUFF_HOOK=9;

var heroes;
var turn;

class Damage{

    damage:number;
    type:number;
    
    debuff:Debuff;


    constructor(dmg_:number,type_:number=DMG_PHY,debuff_:Debuff=new Debuff()){

        this.damage=dmg_;
        this.type=type_;
        this.debuff=debuff_;
    }

}

class Debuff{

    duration:number[];
    
    constructor(type_:number=0,duration_:number=0){
        this.duration=new Array(DEBUFFNUMBER);
        
        for(var i=0;i<DEBUFFNUMBER;i++){
            
            this.duration[i]=0;
            
        }

        this.duration[type_]=duration_;
        
    }

    isClean():boolean{
        for(var i=0;i<DEBUFFNUMBER;i++){
            if(this.duration[i]>0){
                return false;
            }     
        }
        return true;
    }
    
    
}


class Hero {

    side:number;

    name:string;

    hp_o:number;
    atk_o:number;
    def_o:number;
    spd_o:number;


    hp:number;
    atk:number;
    def:number;
    spd:number;

    debuff:Debuff;

    action;
    attack:(d:Damage)=>number;
    hit:(d:Damage)=>number;


    griseo_shield:number;
    griseo_def:number;
    hua_charge:number;
    eden_show:number;
    kalpas_damage:number;
    kalpas_exhaust:number;
    sakura_evade:number;
    villv_box:number;

    logDebuff(){
        if(!this.debuff.isClean()){
            logging_(this.name+"의 상태이상: "
            +(this.debuff.duration[DEBUFF_DISC]?"[봉인] ":"")
            +(this.debuff.duration[DEBUFF_CONF]?"[혼란] ":"")
            +(this.debuff.duration[DEBUFF_SILE]?"[침묵] ":"")
            +(this.debuff.duration[DEBUFF_WEAK]?"[허약] ":"")
            +(this.debuff.duration[DEBUFF_HAZY]?"[혼미] ":"")
            +(this.debuff.duration[DEBUFF_CORR]?"[부식("+this.debuff.duration[DEBUFF_CORR]+"스택)]":"")
            +(this.debuff.duration[DEBUFF_RUPT]?"[파열] ":"")
            );
        }
        
    }


    countdownDebuff(){
        this.debuff.duration[DEBUFF_DISC]>0?this.debuff.duration[DEBUFF_DISC]--:0;       //봉인 디버프 카운트 감소.
        this.debuff.duration[DEBUFF_SILE]>0?this.debuff.duration[DEBUFF_SILE]--:0;       //침묵 디버프 카운트 감소.

        this.debuff.duration[DEBUFF_HAZY]>0?this.debuff.duration[DEBUFF_HAZY]--:0;       //혼미 디버프 카운트 감소.
        this.debuff.duration[DEBUFF_RUPT]>0?this.debuff.duration[DEBUFF_RUPT]--:0;       //파열 디버프 카운트 감소.
        

        if(this.debuff.duration[DEBUFF_WEAK]>0){    //허약 디버프 카운트 감소 및 해제 판정

            if(this.debuff.duration[DEBUFF_WEAK]==1){
                this.atk+=6;
            }
            this.debuff.duration[DEBUFF_WEAK]--;
        }
      
    }

    constructor( name_,side_=0){
        
        this.side=side_;
        
        this.griseo_shield=0;
        this.griseo_def=0;
        this.hua_charge=0;
        this.eden_show=0;
        this.kalpas_damage=0;
        this.kalpas_exhaust=0;
        this.sakura_evade=0;
        this.villv_box=0;

        this.debuff=new Debuff();
        
        
        //일반 피격 함수 설정.
        this.hit=function(dmg_:Damage):number{

            let rd=0;

            if(this.name=="침식의 율자"){
                logging_("침식의 율자의 능력에 의해 영웅의 공격은 소멸했다.");
                return;
            }

            if(dmg_.damage==0 && dmg_.debuff.isClean()){
                return 0;
            }
            if(this.sakura_evade==1){
                logging_("회피");
                return 0;
            }

            if(dmg_.debuff.duration[DEBUFF_EXEC]>0){
                
                if(this.hp<(this.hp_o*0.3)){
                    let exec_rate=Math.random();
                    if(exec_rate<0.3){

                        logging_("<b>더위 제로 발동 : "+this.name+"은/는 Kevin에게 처형당했다.</b>");
                        this.hp=0;
                        return 100;
                    }


                }
            }

            //그리세오 쉴드계산.
            if(this.griseo_shield>0){

                //물리 공격은 방어력 계산.
                if(dmg_.type==DMG_PHY){
                    rd=Math.max(dmg_.damage-(this.def+this.griseo_def),0);
                }
                else{
                    rd=dmg_.damage;
                }

                if(this.griseo_shield>rd){

                    this.griseo_shield-=rd;
                    logging_(this.name+"는 실드로 "+rd+"데미지를 막았다.(남은 실드량:"+this.griseo_shield+")");
                    rd=0;
                }
                else{
                    logging_(this.name+"는 실드로 "+this.griseo_shield+"데미지를 막고 실드가 깨졌다.");
                    rd-=this.griseo_shield;
                    this.griseo_shield=-1;
 
                }
                this.hp-=rd;
            }

            //물리 공격은 방어력 계산.
            else if(dmg_.type==DMG_PHY){

                rd=Math.max(dmg_.damage-(this.def+this.griseo_def),0);
                (this.name=="Hua")?rd=Math.floor(rd*0.8):0;
                this.hp-=rd;
            }
            else{
                rd=dmg_.damage;
                (this.name=="Hua")?rd=Math.floor(rd*0.8):0;
                this.hp-=rd;
            }
            
            if(!dmg_.debuff.isClean()){


                //허약의 공격력 감소 적용
                if(dmg_.debuff.duration[DEBUFF_WEAK]>0 && this.debuff.duration[DEBUFF_WEAK]==0){
                    this.atk-=6;
                }
                //부식의 방어력 감소 적용
                if(dmg_.debuff.duration[DEBUFF_CORR]>0){
                    this.debuff.duration[DEBUFF_CORR]+=dmg_.debuff.duration[DEBUFF_CORR];
                    this.def-=3;

                    if((this.def+this.griseo_def)<0){
                        this.def=(-this.griseo_def);
                    }
                    
                }
                //디버프 턴 적용
                for(var i=0;i<DEBUFFNUMBER;i++){
                    if(this.debuff.duration[i]<dmg_.debuff.duration[i]){
                        this.debuff.duration[i]=dmg_.debuff.duration[i];
                    }
                        
                }
                this.debuff.duration[DEBUFF_EXEC]=0;
                this.debuff.duration[DEBUFF_HOOK]=0;
            }

            if(this.hp>0&& this.griseo_shield==-1){
                logging_("Griseo의 실드 파괴 데미지");
                this.attack(new Damage( dice((this.def+this.griseo_def)*2,(this.def+this.griseo_def)*4) ) );
                this.griseo_shield=0;
            }
            logging_(this.name+"은/는 "+rd+"데미지를 입었다.");

            //갈고리 데미지
            if(dmg_.debuff.duration[DEBUFF_HOOK]>0){
                if(this.debuff.duration[DEBUFF_RUPT]>0){
                    logging_("파열에 의한 3추가 데미지.");
                    this.hit(new Damage(3,DMG_ELE));
                }
                this.hit(new Damage(dmg_.damage,dmg_.type,new Debuff(DEBUFF_HOOK,dmg_.debuff.duration[DEBUFF_HOOK]-1)));

            }
            return rd;

            
        }// end of hit


        //공격 함수 설정
        this.attack=function(dmg_:Damage|number){



            //혹시 모를 입력 체크.
            if(typeof dmg_ == "number"){
                dmg_=new Damage(dmg_);
            }
            
            logging_(this.name+"의 공격 : "+dmg_.damage+((dmg_.type==DMG_PHY)?"(물리)":"(원소)"));

            let rd=0;
            this.side?rd=heroes[0].hit(dmg_):rd=heroes[1].hit(dmg_);

            return rd;
            

        }




        
        switch(name_){

            case KEVIN:{
                this.name="Kevin";


                this.hp_o=100;
                this.atk_o=20;
                this.def_o=11;
                this.spd_o=21;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){
                    
                    let dmg_;
                    
                    this.logDebuff();

                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }
                    //디버프 판정//
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인,혼미

                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){

                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else{this.attack(dmg_);}
                    }

                    
                    //스킬 판정//

                    else{

                        if(!(turn%3)){                     //3턴패시브

                            this.atk+=5;
                            logging_(this.name+"의 청량한 일격 발동. 공격력+5 (현재 공격력:"+this.atk+")");
                            this.attack(new Damage(25,DMG_ELE,new Debuff(DEBUFF_EXEC,1)));
                        }
                        //일반 공격
                        else {
                            dmg_=new Damage(this.atk);

                            //혼란
                            if(this.debuff.duration[DEBUFF_CONF]){

                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                dmg_=new Damage(this.atk);
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            //일반 공격.
                            else{     
                                dmg_=new Damage(this.atk,DMG_PHY,new Debuff(DEBUFF_EXEC,1));
                                this.attack(dmg_);
                            }
                        }


                    }
                    
                    this.atk-=this.kalpas_damage;
                    

                    
                    this.countdownDebuff();


                } // end of action


                break;
            }

            case ELYSIA:{

                this.name="Elysia"


                this.hp_o=100;
                this.atk_o=21;
                this.def_o=8;
                this.spd_o=20;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){
                    
                    let dmg_;
                    
                    this.logDebuff();
                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }
                    //디버프 판정//
                    
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인
                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){
                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                           
                        }
                        else {this.attack(dmg_);}
                    }

                    
                    //스킬 판정//

                    else{

                        if(!(turn%2)){                     //2턴패시브

                            let skilldamage_=dice(25,50);
                            logging_(this.name+"의 여름꿈의 꽃 발동."+skilldamage_+"데미지, 허약 발동.");
                            this.attack(new Damage(skilldamage_,DMG_PHY,new Debuff(DEBUFF_WEAK,1)));
                            
                            if(Math.random()<0.35){                 //35% 확률 스킬

                                if(this.debuff.duration[DEBUFF_CONF]){
                                    logging_(this.name+"의 혼란으로 스스로에게 스플래시 공격");
                                    this.hit(new Damage(11,DMG_ELE))
                                    this.debuff.duration[DEBUFF_CONF]--;
                                    
                                }
                                else    {
                                    logging_(this.name+"의 스플래시 공격");
                                    this.attack(new Damage(this.atk));
                                    this.attack(new Damage(11,DMG_ELE));
                                    
                                }
    
                            }
                        }

                        else if(Math.random()<0.35){                 //35% 확률 스킬

                            if(this.debuff.duration[DEBUFF_CONF]){
                                logging_(this.name+"의 혼란으로 스스로에게 스플래시 공격");
                                this.hit(new Damage(this.atk));
                                this.hit(new Damage(11,DMG_ELE))
                                this.debuff.duration[DEBUFF_CONF]--;
                                
                            }
                            else    {
                                logging_(this.name+"의 스플래시 공격");
                                this.attack(new Damage(this.atk));
                                this.attack(new Damage(11,DMG_ELE));
                                
                            }

                        }
                         //일반 공격
                        else{
                            dmg_=new Damage(this.atk);
                            if(this.debuff.duration[DEBUFF_CONF]){
                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            else    {this.attack(dmg_);}
                        }

                    } 
                    

                    
                    this.countdownDebuff();


                } // end of action

                break;
            }

            case APONIA:{
                
                this.name="Aponia";

                this.hp_o=100;
                this.atk_o=21;
                this.def_o=10;
                this.spd_o=30;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){
                    
                    let dmg_;
                    
                    this.logDebuff();
                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }
                    //디버프 판정//
                    //봉인
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인

                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵


                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){
                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                            

                        }
                        else    {this.attack(dmg_);}
                    }

                    
                    //스킬 판정//

                    else{

                        if(!(turn%4)){                     //4턴패시브
                            logging_(this.name+"의 봉인 공격");
                            this.attack(new Damage(Math.floor(this.atk*1.7),DMG_PHY,new Debuff(DEBUFF_DISC,1)));
                        }

                        else if(Math.random()<0.3){                 //30% 확률 스킬

                            dmg_=new Damage(this.atk,DMG_PHY,new Debuff(DEBUFF_SILE,1));
                            if(this.debuff.duration[DEBUFF_CONF]){
                                logging_(this.name+"의 혼란으로 스스로에게 침묵 공격");
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                                
                            }
                            else    {
                                logging_(this.name+"의 침묵 공격");
                                this.attack(dmg_);
                            }

                            

                        }
                         //일반 공격
                        else{
                            dmg_=new Damage(this.atk);
                            if(this.debuff.duration[DEBUFF_CONF]){
                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            else    {this.attack(dmg_);}
                        }

                    } 
                    

                    
                    this.countdownDebuff();

                } // end of action

                break;
            }

            case EDEN:{

                this.name="Eden";


                this.hp_o=100;
                this.atk_o=16;
                this.def_o=12;
                this.spd_o=16;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){
                    
                    let dmg_;
                    
                    this.logDebuff();
                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }
                    if(this.eden_show==1){
                        logging_(this.name+"은 선공권을 갖고 있다.");
                        this.eden_show=0;
                        this.spd-=1000;
                    }
                    
                    //디버프 판정//
                    
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인

                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){
                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else{this.attack(dmg_);}
                    }

                    
                    //스킬 판정//

                    else{

                        if(!(turn%2)){                     //2턴패시브

                            logging_(this.name+"의 화려한 등장 발동.(공격력+4 ,선공권 획득)");
                            this.eden_show=1;
                            this.spd+=1000;
                            this.atk+=4; 
                        }
                        //일반 공격
                        {
                            dmg_=new Damage(this.atk);

                            //혼란
                            if(this.debuff.duration[DEBUFF_CONF]){
                                if(Math.random()<0.5){     //50% 확률 이중 공격
                                    logging_(this.name+"의 협주 공격. 그러나 혼란 상태이다.");
                                    this.hit(dmg_);
                                }
                                else{
                                    logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                }
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            //일반 공격.
                            else{     
                                if(Math.random()<0.5){
                                                            //50% 확률 이중 공격
                                    logging_(this.name+"의 협주 공격.");
                                    this.attack(dmg_);
                                }
                                this.attack(dmg_);
                            }
                        }


                    } 
                    

                    
                    this.countdownDebuff();


                } // end of action
                
                
                break;
            }
            case VILLV:{

                this.name="Vill-V";

                this.hp_o=100;
                this.atk_o=20;
                this.def_o=12;
                this.spd_o=25;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.villv_box=1;

                this.action=function( turn:number){
                    
                    let dmg_;
                    

                    this.logDebuff();
                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }
                    //디버프 판정//
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인,혼미

                        dmg_=new Damage(0);

                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){
                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else{this.attack(dmg_);}
                    }
                    
                    //스킬 판정//
                    else{

                        if(this.hp<31 && this.villv_box>0){
                            let heal1_=dice(10,20);
                            let heal2_=dice(10,20);
                            let dmgup_=dice(2,15);
                            if(this.side==0){
                                this.hp+=heal1_;
                                heroes[1].hp+=heal2_;

                                this.atk+=dmgup_;

                                logging_(this.name+"의 상자 마술. 체력 "+heal1_+"회복, 공격력 "+dmgup_+"증가. 상대 체력 "+heal2_+"회복.");
                            }
                            else{
                                this.hp+=heal1_;
                                heroes[0].hp+=heal2_;

                                this.atk+=dmgup_;

                                logging_(this.name+"의 상자 마술. 체력 "+heal1_+"회복, 공격력 "+dmgup_+"증가. 상대 체력 "+heal2_+"회복.");
                            }

                            this.villv_box--;
                        }


                        if(!(turn%3)){                     //3턴패시브

                            logging_(this.name+"의 창의력(혼란) 발동.");
                            this.attack(new Damage(this.atk,DMG_PHY,new Debuff(DEBUFF_CONF,1)));
                        }
                        //일반 공격
                        else {
                            dmg_=new Damage(this.atk);

                            //혼란
                            if(this.debuff.duration[DEBUFF_CONF]){
                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            //일반 공격.
                            else{     
    
                                this.attack(dmg_);
                            }
                        }

                    }
                                               
                    this.countdownDebuff();


                } // end of action

                break;
            }

            case KALPAS:{

                this.name="Kalpas";


                this.hp_o=100;
                this.atk_o=23;
                this.def_o=9;
                this.spd_o=26;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){
                    
                    let dmg_;
                    
                    this.logDebuff();

                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }

                    this.kalpas_damage=Math.floor((this.hp_o-this.hp)/5);

                    this.atk+=this.kalpas_damage;
                    
                    if(this.kalpas_damage>0){
                        logging_(this.name+"는 분노로 공격력이 "+this.kalpas_damage+"증가한 상태다.(현재공격력:"+this.atk+")");  
                    }

                    if(this.kalpas_exhaust>0){
                        this.kalpas_exhaust--;
                        logging_(this.name+"는 휴식 중이다.");
                    }
                    
                    //디버프 판정//
                    else if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인,혼미

                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){
                            
                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else{this.attack(dmg_);}
                    }

                    
                    //스킬 판정//

                    else{

                        if(!(turn%3) && this.hp>10){                     //3턴패시브

                            logging_(this.name+"의 한여름의 제물 발동. 체력 -10");
                            this.hp-=10;
                            this.attack(new Damage(45));
                            this.attack(new Damage(dice(1,20),DMG_ELE));
                            this.kalpas_exhaust=1;
                        }
                        //일반 공격
                        else {
                            dmg_=new Damage(this.atk);

                            //혼란
                            if(this.debuff.duration[DEBUFF_CONF]){
                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            //일반 공격.
                            else{     
    
                                this.attack(dmg_);
                            }
                        }


                    }
                    
                    this.atk-=this.kalpas_damage;
                    

                    
                    this.countdownDebuff();


                } // end of action
                break;
            }

            case SU:{
                this.name="Su";

                break;
            }

            case SAKURA:{

                this.name="Sakura";

                this.hp_o=100;
                this.atk_o=24;
                this.def_o=10;
                this.spd_o=27;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){
                    
                    let dmg_;
                    
                    this.logDebuff();
                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }

                    //디버프 판정//
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인,혼미

                        dmg_=new Damage(0);
                        this.sakura_evade=0;
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){
                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else{this.attack(dmg_);}

                    }
                    
                    //스킬 판정//

                    else{



                        if(!(turn%2)){                     //2턴패시브

                            logging_(this.name+"의 수박 썰기 발동.");
                            let heal_=dice(1,5);
                            
                            this.hp+=heal_;
                            if(this.hp>100){
                                this.hp=100;
                            }
                            logging_("체력 "+heal_+" 회복.");
                            this.attack(new Damage(Math.floor(this.atk*1.3)));
                        }
                        //일반 공격
                        else {
                            dmg_=new Damage(this.atk);

                            //혼란
                            if(this.debuff.duration[DEBUFF_CONF]){
                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            //일반 공격.
                            else{     
    
                                this.attack(dmg_);
                            }
                        }

                    }
                                               
                    this.countdownDebuff();


                } // end of action
                break;
            }

            case KOSMA:{

                this.name="Kosma";


                this.hp_o=100;
                this.atk_o=19;
                this.def_o=11;
                this.spd_o=19;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){
                    
                    let dmg_;
                    
                    this.logDebuff();
                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }

                    //디버프 판정//
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인,혼미

                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){
                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else{this.attack(dmg_);}

                    }
                    
                    //스킬 판정//

                    else{



                        if(!(turn%2)){                     //2턴패시브

                            let hook_=dice(11,22);
                            logging_(this.name+"의 심연의 갈고리("+hook_+"x4 데미지).");

                            this.attack(new Damage(hook_,DMG_PHY,new Debuff(DEBUFF_HOOK,3)));

                            if(Math.random()<0.15){
                                dmg_=new Damage(0,DMG_PHY,new Debuff(DEBUFF_RUPT,3));
                                logging_(this.name+"의 돌아오지 않는 발톱 발동. 파열 3턴 부여.")
                            }
                        }
                        //일반 공격
                        else {
                            if(Math.random()<0.15){
                                dmg_=new Damage(this.atk,DMG_PHY,new Debuff(DEBUFF_RUPT,3));
                                logging_(this.name+"의 돌아오지 않는 발톱 발동. 파열 3턴 부여.")
                            }
                            else{
                                dmg_=new Damage(this.atk);
                            }
                            //혼란
                            if(this.debuff.duration[DEBUFF_CONF]){
                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                if(dmg_.debuff.duration[DEBUFF_RUPT]>0){
                                    dmg_.debuff.duration[DEBUFF_RUPT]++;
                                }
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            //일반 공격.
                            else{     
    
                                this.attack(dmg_);
                            }
                        }

                    }
                                               
                    this.countdownDebuff();


                } // end of action

                break;
            }

            case MOBIUS:{

                this.name="Mobius";

                this.hp_o=100;
                this.atk_o=21;
                this.def_o=11;
                this.spd_o=23;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){
                    
                    let dmg_;
                    
                    this.logDebuff();
                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }
                    //디버프 판정//
                    
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인

                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){

                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else{this.attack(dmg_);}
                    }

                    
                    //스킬 판정//

                    else{

                        if(!(turn%3)){                     //3턴패시브

                            if(Math.random()<0.33){
                                logging_(this.name+"의 혼미 공격");
                                this.attack(new Damage(33,DMG_PHY,new Debuff(DEBUFF_HAZY,1)));
                            }
                            else{
                                
                                this.attack(new Damage(33,DMG_PHY));
                            }
                            
                        }
                        //일반 공격
                        else{
                            
                            if(Math.random()<0.33){     //33% 확률 부식
                                logging_(this.name+"의 부식 공격");
                                dmg_=new Damage(this.atk,DMG_PHY,new Debuff(DEBUFF_CORR,1));
                            }
                            else{
                                dmg_=new Damage(this.atk);
                            }

                            if(this.debuff.duration[DEBUFF_CONF]){

                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            else {this.attack(dmg_);} 
                        }


                    } 
                    

                    
                    this.countdownDebuff();


                } // end of action



                break;
            }

            case GRISEO:{

                this.name="Griseo";

                this.hp_o=100;
                this.atk_o=16;
                this.def_o=11;
                this.spd_o=18;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;

                this.action=function( turn:number){

                    let dmg_;

                    this.logDebuff();
                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }
                    //디버프 판정//
                    //봉인
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인
                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){

                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else{this.attack(dmg_);}
                    }

                    
                    //스킬 판정//

                    else{

                        if(!(turn%3)){                     //3턴패시브

                            logging_(this.name+"의 실드 생성");
                            if(this.griseo_shield){
                                logging_(this.name+"남아있던 실드에 의해 "+(this.def+this.griseo_def)+" 데미지");
                                this.attack(new Damage(this.def+this.griseo_def));
                            }
                            this.griseo_shield=15;
                            
                        }

                         //일반 공격
                        else {
                            dmg_=new Damage(this.atk);
                            if(this.debuff.duration[DEBUFF_CONF]){

                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            else {this.attack(dmg_);}
                        }

                        if(Math.random()<0.4){                 //40% 확률 스킬

                            this.griseo_def+=2;
                            logging_(this.name+"의 해변 감시자 발동(방어 2증가. 현재 방어:"+(this.def+this.griseo_def)+")");

                        }

                    } 
                    

                    
                    this.countdownDebuff();

                } // end of action

                
                break;
            }

            case HUA:{
                this.name="Hua";


                this.hp_o=100;
                this.atk_o=21;
                this.def_o=12;
                this.spd_o=15;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){
                    
                    let dmg_;
                    
                    this.logDebuff();
                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }
                    if(this.hua_charge==2){
                        this.hua_charge=0;
                        this.def-=3;
                    }
                    
                    //디버프 판정//
                    
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인

                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){

                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else{this.attack(dmg_);}
                    }

                    
                    //스킬 판정//

                    else{

                        if(!(turn%2)){                     //2턴패시브

                            logging_(this.name+"는 차지를 준비하고 있다.");
                            this.hua_charge=1;
                            
                        }
                        //일반 공격
                        else{
                            
                            if(this.hua_charge==1){
                                this.def+=3;
                                logging_(this.name+"의 차지 공격 발동. 방어력+3");
                                this.attack(new Damage(dice(10,33),DMG_ELE));
                                this.hua_charge=2;
                            }

                            if(this.debuff.duration[DEBUFF_CONF]){

                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                this.hit(new Damage(this.atk));
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            else {this.attack(this.atk);} 
                        }


                    } 
                    
                    this.countdownDebuff();


                } // end of action


                break;
            }

            case PARDO:{

                this.name="Pardofelis";

                this.hp_o=100;
                this.atk_o=17;
                this.def_o=10;
                this.spd_o=24;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){

                    let dmg_;

                    this.logDebuff();
                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }
                    //디버프 판정//
                    //봉인
                    if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인

                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵

                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){

                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else   {this.attack(dmg_);}

                    }
                    //스킬 판정//

                    else{

                        if(!(turn%3)){                     //3턴패시브

                            
                            let heal_=this.attack(new Damage(30));

                            
                            //회복
                            this.hp+=heal_;
                            this.hp>this.hp_o?this.hp=this.hp_o:0;
                            logging_(this.name+"의 회복:"+heal_);

                            if(Math.random()<0.3){                 //30% 확률 스킬

                                logging_(this.name+"의 깡통 소환(30 공격)");
                                this.attack(new Damage(30));
                                
    
                            }

                            
                        }

                        //일반 공격
                        else{
                            dmg_=new Damage(this.atk);
                            if(this.debuff.duration[DEBUFF_CONF]){

                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            else{this.attack(dmg_);}

                            if(Math.random()<0.3){                 //30% 확률 스킬

                                logging_(this.name+"의 깡통 소환(30 공격)");
                                this.attack(new Damage(30));
                                
    
                            }
                        }

  

                    } 
                    

                    
                    this.countdownDebuff();

                } // end of action

            }
            case MEI:{
                this.name="침식의 율자";


                this.hp_o=100;
                this.atk_o=200;
                this.def_o=50;
                this.spd_o=1;

                this.hp=this.hp_o;
                this.atk=this.atk_o;
                this.def=this.def_o;
                this.spd=this.spd_o;


                this.action=function( turn:number){
                    
                    let dmg_;
                    
                    this.logDebuff();

                    if(this.debuff.duration[DEBUFF_RUPT]>0){
                        this.hp-=4;
                        logging_("파열에 의해 4 데미지");
                        if(this.hp<=0){
                            this.hp=0;
                            return;
                        }
                    }
                    //디버프 판정//
                    /*if(this.debuff.duration[DEBUFF_DISC]||this.debuff.duration[DEBUFF_HAZY]){ //봉인,혼미

                        dmg_=new Damage(0);
                    }   
                    else if(this.debuff.duration[DEBUFF_SILE]){ //침묵
                        dmg_=new Damage(this.atk);
                        if(this.debuff.duration[DEBUFF_CONF]){

                            logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                            this.hit(dmg_);
                            this.debuff.duration[DEBUFF_CONF]--;
                        }
                        else{this.attack(dmg_);}
                    }
                    */

                    
                    //스킬 판정//

                    {


                        //일반 공격
                        {
                            dmg_=new Damage(this.atk);

                            //혼란
                            if(this.debuff.duration[DEBUFF_CONF]){

                                logging_(this.name+"는 혼란으로 스스로 데미지를 입었다.");
                                dmg_=new Damage(this.atk);
                                this.hit(dmg_);
                                this.debuff.duration[DEBUFF_CONF]--;
                            }
                            //일반 공격.
                            else{     

                                logging_("침식의 율자의 소멸 공격");
                                dmg_=new Damage(this.atk);
                                this.attack(dmg_);
                            }
                        }


                    }
                    
                    this.countdownDebuff();


                } // end of action


                break;
            }
         }//end of switch
    }


}


function writeInfo_(div_:HTMLDivElement= <HTMLDivElement>document.getElementById("info")){

        
        div_.innerHTML="<table><tr><td width=300 style=\"font-size:45px;\">"+heroes[0].name+"</td><td width=300 style=\"font-size:45px;\">"+heroes[1].name+"</td></tr></table>";
}

function logging_(s:string,div_:HTMLDivElement= <HTMLDivElement>document.getElementById("log")){
    
    if(WRITELOG){
        div_.innerHTML+="Turn : "+turn+"/ HP "+heroes[0].hp+" : "+heroes[1].hp+" ||| ";
        div_.innerHTML+=s+"<br>";
    }
    
}


function dice(min_:number,max_:number){

    return min_+Math.floor(Math.random()*(max_+1-min_));

}


function whoisWinner():number{

    if(heroes[0].hp<=0 && heroes[1].hp<=0){
        WRITELOG?alert("무승부"):0;
        return 2;
    }
    else if(heroes[0].hp<=0){
        if(WRITELOG){
            alert(heroes[1].name+" 승리");
            logging_(heroes[1].name+" 승리");
        }
        
        return 1;
    }
    else {
        if(WRITELOG){
            alert(heroes[0].name+" 승리");
            logging_(heroes[0].name+" 승리");
        }
        
        return 0;
    }
}


function runSimulation(hero1_,hero2_){
    var wincount=[0,0,0];

    writeInfo_();
    
    
    
    while(wincount[0]+wincount[1]+wincount[2]<SIMULATING_NUMBER){
    
        turn=1;
        while(heroes[0].hp>0 && heroes[1].hp>0 && turn<300){
    
            //사쿠라 회피 하드코딩
            if(heroes[0].name=="Sakura"){
                if(Math.random()<0.15){
                    heroes[0].sakura_evade=1;
                    logging_("이번 턴은 사쿠라의 회피가 발동중이다.");
                }
                
            }
            else if(heroes[1].name=="Sakura"){
                if(Math.random()<0.15){
                    heroes[1].sakura_evade=1;
                    logging_("이번 턴은 사쿠라의 회피가 발동중이다.");
                }
                
            }
    
    
            if(heroes[0].spd>=heroes[1].spd){
                heroes[0].action(turn);
    
                (heroes[0].hp>0 && heroes[1].hp>0)?heroes[1].action(turn):0;
                
            }
            else{
                heroes[1].action(turn);
    
                (heroes[0].hp>0 && heroes[1].hp>0)?heroes[0].action(turn):0;
                            
            }
    
            //사쿠라 회피 종료.
            heroes[0].sakura_evade=0;
            heroes[1].sakura_evade=0;
    
            turn++;
            logging_("===============================================");
        }
        wincount[whoisWinner()]++;
    
        heroes=[new Hero(hero1_,0),new Hero(hero2_,1)];
    }
    
    if(!WRITELOG){
        alert(heroes[0].name + " " + wincount[0]+"승 : "+wincount[1]+"승 " +heroes[1].name+"\n"+wincount[2]+"무");
        document.writeln(SIMULATING_NUMBER+" 번 시뮬레이션 결과.<br>");
        document.writeln(heroes[0].name + " " + wincount[0]+"승 : "+wincount[1]+"승 " +heroes[1].name+"\n<br>"+wincount[2]+"무");
    }
    
}

