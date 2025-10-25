import React, { useState } from "react";
import { ImSpinner10 } from "react-icons/im";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

const AnimateSpin = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submitHandler = async () => {
    try {
      if (
        email.trim() === "" ||
        password.trim() === "" ||
        password.trim().length < 6
      ) {
        alert("incorrect email or password format");
        return;
      }

      setLoading(true);

      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );
      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-[100vh]">
      <div className="flex gap-1 items-center justify-around rounded-md p-5 w-[60rem] shadow-2xl">
        <div className="w-[45%] h-[25rem]">
          <img src="/tiktok-1.avif" alt="" className="h-full object-cover" />
        </div>
        <div className="flex flex-col gap-4 w-[45%]">
          <p className="font-semibold text-2xl">Login</p>
          <div className="flex flex-col gap-1 items-start w-full">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              value={email}
              className="border border-gray-500 rounded-md px-3 py-2 w-full"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 items-start w-full">
            <label htmlFor="password">Password</label>

            <div className="w-full relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                className="border border-gray-500 rounded-md px-3 py-2 w-full pr-5"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[50%] -translate-y-[50%]"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            onClick={submitHandler}
            className="flex items-center justify-center gap-1 bg-blue-600 px-6 py-3 rounded-md text-white cursor-pointer"
          >
            <span>Submit</span>
            {loading && <ImSpinner10 size={20} className="spin" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimateSpin;
