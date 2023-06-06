import { signIn } from "next-auth/react";

export const Login: React.FC = () => {
  return (
    <>
      <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#1c6641] to-[#9DC88D] font-poppins">
        <div className="container mx-auto px-6 py-12 h-full flex justify-center items-center">
          <div className="md:w-8/12 lg:w-5/12 bg-black/30 px-8 py-10 backdrop-blur-sm shadow-xl shadow-black/30 text-center text-white">
            <label>You need to log in to use this service. Click <button onClick={() => void signIn()} className="text-[#9DC88D] hover:text-[#cfe6c8]">here</button> to go to login.</label>
          </div>
        </div>
      </section>
    </>
  );
}