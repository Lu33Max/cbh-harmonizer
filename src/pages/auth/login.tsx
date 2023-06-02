import { type GetServerSidePropsContext, type InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { getProviders, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authOptions } from "~/server/auth";

export default function LoginPage({ providers }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <section className="bg-ct-blue-600 min-h-screen pt-20">
        <div className="container mx-auto px-6 py-12 h-full flex justify-center items-center">
          <div className="md:w-8/12 lg:w-5/12 bg-white px-8 py-10">
            <LoginForm providers={providers} />
          </div>
        </div>
      </section>
    </>
  );
}

export const LoginForm = ({ providers }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const searchBar = useSearchParams();
  const searchQuery = searchBar.get('prev');
  const callbackURL = searchQuery ? encodeURI(searchQuery) : "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
        callbackUrl: "/"
      });

      if(res?.ok){
        router.push(callbackURL)
      }

    } catch (error) {
      setError(JSON.stringify(error))
    }
  };

  const input_style =
    "form-control block w-full px-4 py-5 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none";

  return (
    <form onSubmit={e => void onSubmit(e)}>
      {error && (
        <p className="text-center bg-red-300 py-4 mb-6 rounded">{error}</p>
      )}
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
        type="submit"
        style={{ backgroundColor: "#3446eb" }}
        className="inline-block px-7 py-4 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out w-full"

      >
        Sign In
      </button>

      <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
        <p className="text-center font-semibold mx-4 mb-0">OR</p>
      </div>

      {Object.values(providers).filter(provider => provider.name !== "credentials").map((provider) => (
        <>
          <div key={provider.name}>
            <button onClick={() => void signIn(provider.id)}>
              Sign in with {provider.name}
            </button>
          </div>    
        </>
      ))}

      <div className="text-center">
        <p>Don&apos;t have an account yet? <Link href={`/auth/signup?prev=${callbackURL}`} className="text-blue-700">Sign Up</Link></p>
      </div>
    </form>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();
  
  return {
    props: { providers: providers ?? [] },
  }
}