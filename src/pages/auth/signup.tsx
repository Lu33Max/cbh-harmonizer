import type { NextPage } from "next";
import React, { useState } from "react";
import Link from "next/link";

import { signUpSchema, type ISignUp } from "../../common/validation/auth";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const SignUp: NextPage = () => {
  return (
    <>
      <main className="bg-ct-blue-600 min-h-screen pt-20">
        <div className="container mx-auto px-6 py-12 h-full flex justify-center items-center">
          <div className="md:w-8/12 lg:w-5/12 bg-white px-8 py-10">
            <SignUpForm />
          </div>
        </div>
      </main>
    </>
  );
};

const SignUpForm = () => {
  const router = useRouter();
  const [formValues, setFormValues] = useState<ISignUp>({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const searchBar = useSearchParams();
  const searchQuery = searchBar.get('prev');
  const callbackURL = searchQuery ? encodeURI(searchQuery) : "/";

  const createUser = api.auth.signup.useMutation();

  async function onSubmit() {
    try {
      const data = await signUpSchema.parseAsync(formValues);
      try {
        await createUser.mutateAsync(data);
        
        const res = await signIn('credentials', {
          redirect: false,
          email: formValues.email,
          password: formValues.password,
          callbackUrl: "/"
        });
  
        if(res?.ok){
          void router.push(callbackURL)
        }

      } catch(error){
        setError("Email already exists");
      }  
    } catch (error) {
      setError("Not a valid input type")
    }
  }

  const input_style =
    "form-control block w-full px-4 py-5 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none";

  return(
    <div>
      {error && (
        <p className="text-center bg-red-300 py-4 mb-6 rounded">{error}</p>
      )}
      <div className="mb-6">
        <input
          required
          type="text"
          name="username"
          value={formValues.username}
          onChange={e => setFormValues({...formValues, username: e.target.value})}
          placeholder="Username"
          className={`${input_style}`}
        />
      </div>
      <div className="mb-6">
        <input
          required
          type="email"
          name="email"
          value={formValues.email}
          onChange={e => setFormValues({...formValues, email: e.target.value})}
          placeholder="Email address"
          className={`${input_style}`}
        />
      </div>
      <div className="mb-6">
        <input
          required
          type="password"
          name="password"
          value={formValues.password}
          onChange={e => setFormValues({...formValues, password: e.target.value})}
          placeholder="Password"
          className={`${input_style}`}
        />
      </div>
      <button
        style={{ backgroundColor: "#3446eb" }}
        className="inline-block px-7 py-4 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out w-full"
        onClick={() => void onSubmit()}
      >
        Sign Up
      </button>

      <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
        <p className="text-center font-semibold mx-4 mb-0">OR</p>
      </div>

      <div className="text-center">
        <p>Already have an account? <Link href={`/auth/login?prev=${callbackURL}`} className="text-blue-700">Sign In</Link></p>
      </div>
    </div>
  )
}

export default SignUp;
