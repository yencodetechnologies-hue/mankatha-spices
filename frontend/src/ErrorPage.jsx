import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1 className="text-center mt-5" >Oops!</h1>
      <p className="text-center text-black text-[60px]">404 Page Not Found</p>
      <p className="text-center text-black text-[20px]">Sorry, an unexpected error has occurred.</p>
      <p className="text-center mt-2">
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}