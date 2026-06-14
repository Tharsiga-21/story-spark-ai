import { useForm, SubmitHandler } from "react-hook-form";
import SSInput from "../ui-component/ss-input/ss-input";
import SSButton from "../ui-component/ss-button/ss-button";
import { useState, useEffect } from "react";
import { storeUserInfo } from "../../services/auth.service";
import toast, { Toaster } from "react-hot-toast";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import {
  useEmailVerifyMutation,
  useVerifyOtpMutation,
} from "../../redux/apis/otp.verify.api";
import {
  useRegisterUserMutation,
  useGoogleLoginMutation,
} from "../../redux/apis/auth.api";

import {
  WandSparkles,
  BookOpen,
  UsersRound
} from "lucide-react";


interface IRegisterInfo {
  name:string;
  email:string;
  password:string;
}


interface Inputs extends IRegisterInfo{
  confirmPassword:string;
  otp:string;
}



const getPasswordError=(password:string)=>{

 if(password.length<8)
 return "Password must be at least 8 characters long";

 if(!/[A-Z]/.test(password))
 return "Password must contain uppercase letter";

 if(!/[a-z]/.test(password))
 return "Password must contain lowercase letter";

 if(!/[0-9]/.test(password))
 return "Password must contain number";

 if(!/[^A-Za-z0-9]/.test(password))
 return "Password must contain special character";


 return "";
}



type StrengthLevel="weak"|"medium"|"strong";


const PASSWORD_STRENGTH_CONFIG={
 weak:{
  label:"Weak",
  barColor:"bg-red-500",
  barWidth:"w-1/3",
  textColor:"text-red-400"
 },

 medium:{
  label:"Medium",
  barColor:"bg-yellow-400",
  barWidth:"w-2/3",
  textColor:"text-yellow-400"
 },

 strong:{
  label:"Strong",
  barColor:"bg-green-500",
  barWidth:"w-full",
  textColor:"text-green-400"
 }
}



const getStrengthLevel=(count:number):StrengthLevel=>{

 if(count<=2)
 return "weak";

 if(count<=4)
 return "medium";

 return "strong";

}




const PASSWORD_REQUIREMENTS=[

{
key:"length",
label:"Minimum 8 characters"
},

{
key:"uppercase",
label:"One uppercase letter"
},

{
key:"lowercase",
label:"One lowercase letter"
},

{
key:"number",
label:"One number"
},

{
key:"special",
label:"One special character"
}

] as const;






const SignUpComponent=()=>{


const navigate=useNavigate();


const [emailVerify]=useEmailVerifyMutation();

const [verifyOtp]=useVerifyOtpMutation();

const [registerUser]=useRegisterUserMutation();

const [googleLogin]=useGoogleLoginMutation();



const {

register,
handleSubmit,
watch,
setValue,
unregister,
formState:{errors}

}=useForm<Inputs>({
mode:"onChange"
});




const [isBusy,setIsBusy]=useState(false);

const [showOtpField,setShowOtpField]=useState(false);

const [registerInfo,setRegisterInfo]=
useState<IRegisterInfo>();

const [expiredAt,setExpiredAt]=useState(0);

const [cooldown,setCooldown]=useState(0);




useEffect(()=>{


if(cooldown<=0)
return;


const timer=setInterval(()=>{

setCooldown(prev=>Math.max(0,prev-1));

},1000);



return()=>clearInterval(timer);



},[cooldown]);






const password=watch("password");

const confirmPassword=watch("confirmPassword");

const otp=watch("otp");




const passwordChecks={

length:password?.length>=8,

uppercase:/[A-Z]/.test(password||""),

lowercase:/[a-z]/.test(password||""),

number:/[0-9]/.test(password||""),

special:/[^A-Za-z0-9]/.test(password||"")

}



const passedChecks=
Object.values(passwordChecks)
.filter(Boolean)
.length;



const strengthLevel=
getStrengthLevel(passedChecks);



const {

label:strengthLabel,

barColor,

barWidth,

textColor


}=PASSWORD_STRENGTH_CONFIG[strengthLevel];





const onSubmit:SubmitHandler<Inputs>=async(data)=>{


if(data.password!==data.confirmPassword)
{
toast.error("Passwords do not match");
return;
}



const passwordError=
getPasswordError(data.password);



if(passwordError)
{
toast.error(passwordError);
return;
}



setIsBusy(true);



try{


const res=
await emailVerify({

name:data.name,

email:data.email

}).unwrap();




if(res.data){


setExpiredAt(
new Date(res.data.expiresAt).getTime()
);



setRegisterInfo({

name:data.name,

email:data.email,

password:data.password

});



toast.success("OTP sent to email");



unregister("name");

unregister("email");

unregister("password");

unregister("confirmPassword");



setShowOtpField(true);

setCooldown(60);


}



}

catch(err:any){

toast.error(
err?.data?.[0]?.message ||
"Failed to send OTP"
);

}


finally{

setIsBusy(false);

}


};
const handleOtpValidation = async()=>{


if(!otp){

toast.error("Enter OTP");

return;

}


if(!registerInfo){

toast.error("Restart signup process");

return;

}



if(Date.now()>expiredAt){

toast.error("OTP expired");

return;

}



setIsBusy(true);



try{


const otpResponse =
await verifyOtp({

email:registerInfo.email,

otp

}).unwrap();





if(otpResponse?.data?.verificationToken){


const res =
await registerUser({

...registerInfo,

verificationToken:
otpResponse.data.verificationToken

}).unwrap();





if(res.data.accessToken){


storeUserInfo({

accessToken:res.data.accessToken

});

toast.success("Account created successfully");


navigate("/");


}



}


}

catch(err:any){

toast.error(

err?.data?.[0]?.message ||

"OTP verification failed"

);

}


finally{

setIsBusy(false);

}



};





const handleResendOtp=async()=>{


if(cooldown>0)
return;


if(!registerInfo)
return;



setIsBusy(true);


try{


const res =
await emailVerify({

name:registerInfo.name,

email:registerInfo.email

}).unwrap();



if(res.data){


setExpiredAt(
new Date(res.data.expiresAt).getTime()
);


setCooldown(60);


setValue("otp","");


toast.success("OTP resent");

}


}

catch(err:any){

toast.error(
"Failed to resend OTP"
);

}


finally{

setIsBusy(false);

}



};






const handleGoogleLoginSuccess=
async(
credentialResponse:CredentialResponse
)=>{


setIsBusy(true);


try{


const res =
await googleLogin({

token:
credentialResponse.credential

}).unwrap();




if(res.data.accessToken){


storeUserInfo({

accessToken:
res.data.accessToken

});


toast.success(
"Google login successful"
);


navigate("/");


}



}

catch{

toast.error(
"Google login failed"
);

}

finally{

setIsBusy(false);

}


};




const handleGoogleLoginError=()=>{

toast.error(
"Google login failed"
);

};






return (

<div className="
min-h-screen w-full
flex items-center justify-center
bg-slate-50 dark:bg-slate-950
px-4 py-10
relative overflow-hidden
">


<div className="
absolute top-[-10%]
left-[-10%]
w-96 h-96
bg-blue-600/20
rounded-full
blur-[120px]
"/>



<div className="
absolute bottom-[-10%]
right-[-10%]
w-96 h-96
bg-indigo-600/20
rounded-full
blur-[120px]
"/>




<div className="
max-w-6xl w-full
flex flex-col lg:flex-row
gap-10
items-center
relative z-10
">



{/* LEFT SIDE */}


<div className="
w-full lg:w-1/2
space-y-5
">


<h1 className="
text-5xl font-bold
bg-gradient-to-r
from-blue-400
to-purple-600
bg-clip-text
text-transparent
">

Turn Ideas Into

<br/>

Unforgettable Stories

</h1>




<p className="
text-slate-500
dark:text-slate-400
">

AI powered storytelling that helps you
create, connect and inspire.

</p>




{[

[
<WandSparkles/>,
"Smart Writing",
"AI that understands your ideas"
],


[
<BookOpen/>,
"Endless Creativity",
"Stories that captivate and inspire"
],


[
<UsersRound/>,
"Built for everyone",
"Writers, creators and dreamers"
]

].map((item,index)=>(


<div
key={index}
className="
flex items-center
gap-5
border
rounded-2xl
p-4
bg-white
dark:bg-slate-800
"
>


<div className="text-violet-600">

{item[0]}

</div>


<div>

<h3 className="font-bold">

{item[1]}

</h3>


<p className="text-sm">

{item[2]}

</p>


</div>



</div>


))}



</div>





{/* RIGHT SIDE CARD */}



<div className="
w-full lg:w-1/2
max-w-md
bg-white
dark:bg-slate-800
rounded-3xl
p-8
shadow-2xl
border
">





<h2 className="
text-center
text-3xl
font-bold
">

{showOtpField
?
"Verify Email"
:
"Create Account"
}


</h2>





{!showOtpField ? (



<form
onSubmit={
handleSubmit(onSubmit)
}
className="space-y-5 mt-6"
>




<SSInput

label="Name"

name="name"

placeholder="Enter name"

register={register}

validation={{
required:"Name required"
}}

error={errors.name}

/>





<SSInput

label="Email"

name="email"

type="email"

placeholder="Enter email"

register={register}

validation={{
required:"Email required"
}}

error={errors.email}

/>





<SSInput

label="Password"

name="password"

type="password"

placeholder="Password"

register={register}

error={errors.password}

/>





<SSInput

label="Confirm Password"

name="confirmPassword"

type="password"

placeholder="Confirm password"

register={register}

error={errors.confirmPassword}

/>






{password && (

<div>


<div className="
h-2
bg-slate-200
rounded
">


<div className={`
h-full
${barColor}
${barWidth}
`}/>


</div>



<p className={textColor}>

{strengthLabel} Password

</p>


</div>

)}




<SSButton

text="Sign Up"

type="submit"

isLoading={isBusy}

/>



</form>



):(



<div className="space-y-5 mt-6">



<SSInput

label="OTP"

name="otp"

placeholder="Enter OTP"

register={register}

error={errors.otp}

/>




<SSButton

text="Verify OTP"

type="button"

onClick={handleOtpValidation}

isLoading={isBusy}

/>





<button

onClick={handleResendOtp}

className="
text-blue-500
text-sm
block mx-auto
"

>

{
cooldown>0
?
`Resend OTP (${cooldown}s)`
:
"Resend OTP"
}


</button>




</div>



)}






{!showOtpField && (



<>


<div className="
my-8 border-t
"/>




<div className="flex justify-center">

<GoogleLogin

onSuccess={
handleGoogleLoginSuccess
}

onError={
handleGoogleLoginError
}

/>


</div>





<p className="
text-center
mt-6
text-sm
">


Already have account?


<Link

to="/login"

className="
text-blue-500
font-bold
ml-2
"

>

Login

</Link>



</p>



</>



)}





</div>






</div>



<Toaster

position="top-right"

/>



</div>


);

};


export default SignUpComponent;
