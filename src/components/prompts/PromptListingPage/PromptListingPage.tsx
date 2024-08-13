import Button from "@/components/Button/Button";

function IconPlaceholder() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="32" fill="#712FFF" fill-opacity="0.2" />
      <path
        d="M38.9835 15.334H25.0168C18.9502 15.334 15.3335 18.9507 15.3335 25.0173V38.9673C15.3335 45.0507 18.9502 48.6673 25.0168 48.6673H38.9668C45.0335 48.6673 48.6502 45.0507 48.6502 38.984V25.0173C48.6668 18.9507 45.0502 15.334 38.9835 15.334ZM26.1668 22.634C27.8835 22.634 29.3002 24.034 29.3002 25.7673C29.3002 27.5007 27.9002 28.9007 26.1668 28.9007C24.4335 28.9007 23.0335 27.4673 23.0335 25.7507C23.0335 24.034 24.4502 22.634 26.1668 22.634ZM32.0002 43.8006C27.5168 43.8006 23.8668 40.1507 23.8668 35.6673C23.8668 34.5007 24.8168 33.534 25.9835 33.534H37.9835C39.1502 33.534 40.1002 34.484 40.1002 35.6673C40.1335 40.1507 36.4835 43.8006 32.0002 43.8006ZM37.8335 28.8673C36.1168 28.8673 34.7002 27.4673 34.7002 25.734C34.7002 24.0007 36.1002 22.6007 37.8335 22.6007C39.5668 22.6007 40.9668 24.0007 40.9668 25.734C40.9668 27.4673 39.5502 28.8673 37.8335 28.8673Z"
        fill="#712FFF"
      />
    </svg>
  );
}

function RelatedAppIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="24" fill="#00F0FF" fill-opacity="0.2" />
      <path
        d="M30.9401 17.4195L25.7701 14.4295C24.7801 13.8595 23.2301 13.8595 22.2401 14.4295L17.0201 17.4395C14.9501 18.8395 14.8301 19.0495 14.8301 21.2795V26.7095C14.8301 28.9395 14.9501 29.1595 17.0601 30.5795L22.2301 33.5695C22.7301 33.8595 23.3701 33.9995 24.0001 33.9995C24.6301 33.9995 25.2701 33.8595 25.7601 33.5695L30.9801 30.5595C33.0501 29.1595 33.1701 28.9495 33.1701 26.7195V21.2795C33.1701 19.0495 33.0501 18.8395 30.9401 17.4195ZM24.0001 27.2495C22.2101 27.2495 20.7501 25.7895 20.7501 23.9995C20.7501 22.2095 22.2101 20.7495 24.0001 20.7495C25.7901 20.7495 27.2501 22.2095 27.2501 23.9995C27.2501 25.7895 25.7901 27.2495 24.0001 27.2495Z"
        fill="#00F0FF"
      />
    </svg>
  );
}

/**
 * A prompt store page, this is the page that shows an individual prompt.
 */
export default function PromptListingPage() {
  return (
    <div className="p-20">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col justify-center gap-6">
          <div className="flex space-x-4">
            <IconPlaceholder />
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl">App Name</h1>
              <h6 className="text-light-60">Created by Robert California</h6>
            </div>
          </div>
          <p className="w-3/4">
            Here’s some information about this app so that you feel more
            compelled to try this app out. Help people use your apps by adding
            actions. Learn more about prompt suggestions here.
          </p>
          <Button size="large" variant="primary">
            Try for free
          </Button>
        </div>
        <div className="flex justify-center items-center">
          {/* Video rectangle */}
          <div className="bg-purple-800 rounded-2xl h-52 w-full "></div>
        </div>
      </div>
      <hr className="h-px my-10 border-0 bg-light-5" />
      <div className="flex flex-col lg:flex-row w-full">
        <div className="flex-initial lg:w-1/2">
          <h4>Features</h4>
          <p>
            SmartReply Analysis revolutionizes how businesses handle online
            reviews. By leveraging AI and screen context, it automatically
            analyzes customer feedback, generates appropriate responses, and
            provides actionable insights, saving you time and improving customer
            satisfaction.
          </p>
        </div>
        <div className="">
          <h4 className="text-light-20">Related Apps</h4>
          <div className="flex space-x-4 border rounded-xl border-light-10 p-3 ">
            <RelatedAppIcon />
            <div className="flex flex-col gap-0.5">
              <p className="text-light-100">App Name</p>
              <p className="text-light-60">Description</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
