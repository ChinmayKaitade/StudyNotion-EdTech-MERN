import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <section className="p-[40px] bg-white pt-[100px] ">
      <div>
        <div>
          <div>
            <div className="text-center">
              <div className="h-[400px] bg-center bg-[url(https://cdn.dribbble.com/userupload/45612463/file/e5756e0cd3751fc20e904bd555246587.gif)] ">
                <h1 className="text-center text-5xl font-extrabold text-black ">
                  Oops! Page Not Found
                </h1>
              </div>

              <div className="-mt-12 ">
                <h3 className="text-4xl mb-1 font-semibold">
                  Look like you're lost
                </h3>

                <p className="text-3xl mb-1">
                  The page you are looking for not available!
                </p>

                <Link
                  to="/"
                  className=" py-[13px] px-10 text-lg bg-yellow-25 hover:bg-richblue-700 hover:text-yellow-50 my-5 inline-block rounded-full font-semibold duration-300"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageNotFound;
