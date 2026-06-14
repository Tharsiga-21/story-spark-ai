import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { WandSparkles , BookOpen, UsersRound} from "lucide-react";


import SSInput from "../ui-component/ss-input/ss-input";
import SSButton from "../ui-component/ss-button/ss-button";

import {
  useLoginUserMutation,
  useGoogleLoginMutation,
} from "../../redux/apis/auth.api";

import {
  storeUserInfo,
  getUserInfo,
} from "../../services/auth.service";

import { USER_ROLE } from "../../constants/role";
import RedirectComponent from "../redirect.component";

type Inputs = {
  email: string;
  password: string;
};

const LoginComponent = () => {
  const [loginUser] = useLoginUserMutation();
  const [googleLogin] = useGoogleLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ mode: "onChange" });

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsBusy(true);
    try {
      const res = await loginUser({ ...data }).unwrap();
      if (res.data.accessToken) {
        toast.success("User logged in successfully!");
        storeUserInfo({ accessToken: res.data.accessToken });
        setIsLoggedIn(true);
      }
    } catch {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse,) => {
    setIsBusy(true);
    try {
      const res = await googleLogin({
        token: credentialResponse.credential,
      }).unwrap();
      if (res.data.accessToken) {
        toast.success("User logged in successfully with Google!");
        storeUserInfo({
          accessToken: res.data.accessToken,
        });
        setIsLoggedIn(true);
      }
    } catch {
      toast.error("Failed to login with Google. Please try again.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google login failed. Please try again.");
  };

  if (isLoggedIn) {
    const userInfo = getUserInfo();
    const isDashboardUser =
      userInfo?.role === USER_ROLE.ADMIN ||
      userInfo?.role === USER_ROLE.SUPER_ADMIN;
    return (
      <RedirectComponent
        defaultPath={isDashboardUser ? "/dashboard" : "/explore"}
      />
    );
  }

  return (
  <div className="min-h-screen bg-white dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex items-center justify-center relative overflow-hidden px-4">
    {/* Background Glow */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"
    />

    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, delay: 0.2 }}
      className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"
    />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col lg:flex-row w-full max-w-6xl gap-12 items-center relative z-10"
    >
      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-700 bg-clip-text text-transparent">
          Turn Ideas Into
          <br />
          Unforgettable Stories
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-lg">
          AI-powered storytelling that helps you create, connect and inspire.
        </p>

        <div className="flex items-center gap-4 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800">
          <WandSparkles className="text-violet-600 shrink-0" />
          <div>
            <h3 className="font-semibold">Smart Writing</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI that understands your ideas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800">
          <BookOpen className="text-violet-600 shrink-0" />
          <div>
            <h3 className="font-semibold">Endless Creativity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Stories that captivate and inspire
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800">
          <UsersRound className="text-violet-600 shrink-0" />
          <div>
            <h3 className="font-semibold">Built For Everyone</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Writers, creators and dreamers
            </p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Create, edit and generate engaging story variations from a
          single prompt. Perfect for writers, creators and enthusiasts
          exploring the future of fiction.
        </div>
      </div>

      {/* RIGHT SIDE LOGIN CARD */}
      <div className="w-full lg:w-1/2 max-w-md bg-slate-50 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-8 sm:p-10 shadow-2xl">
        <button
          onClick={() => (window.location.href = "/")}
          className="mb-4 text-sm text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          ← Back to Home
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Welcome Back
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sign in to your Story Spark AI account
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <SSInput
            label="Email address"
            name="email"
            type="email"
            placeholder="Enter your email"
            required={true}
            icon="fi fi-rr-envelope"
            register={register}
            validation={{ required: "Email is required" }}
            error={errors.email}
            autoComplete="email"
          />

          <div>
            <SSInput
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required={true}
              icon="fi fi-rr-lock"
              register={register}
              validation={{ required: "Password is required" }}
              error={errors.password}
            />

            <div className="flex justify-end pt-2">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <SSButton
            text="Sign In"
            type="submit"
            isLoading={isBusy}
          />
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>

          <div className="relative flex justify-center">
            <span className="bg-slate-50 dark:bg-slate-800 px-4 text-xs uppercase tracking-wider text-slate-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
          />
        </div>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </motion.div>

    <Toaster position="top-right" reverseOrder={false} />
  </div>
);
};

export default LoginComponent;