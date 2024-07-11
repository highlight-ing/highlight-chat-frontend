import { useEffect, useRef } from "react";
import { Attachment } from "../Attachment";
import { AttachmentsButton } from "../AttachmentsButton";
import { useInputContext } from "../../context/InputContext";
import { Attachment as AttachmentType } from "../../app/types/types";
import { useSubmitQuery } from "../../hooks/useSubmitQuery";

import styles from "./chatinput.module.scss";
import * as React from "react";

const PLACEHOLDER_TEXT = "Ask Highlight anything...";
const MAX_INPUT_HEIGHT = 160;

export const Input = ({ offset }: { offset: boolean }) => {
  const { attachments, input, setInput, isDisabled } = useInputContext();
  const { handleSubmit } = useSubmitQuery();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isDisabled && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      setInput("");
    }
  };

  const onClickContainer = (e: React.MouseEvent) => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "0px";
      const scrollHeight = inputRef.current.scrollHeight;

      const newHeight =
        scrollHeight > MAX_INPUT_HEIGHT ? MAX_INPUT_HEIGHT : scrollHeight;
      inputRef.current.style.height = newHeight + "px";
    }
  }, [inputRef, input]);

  return (
    <div
      className={`${styles.inputContainer} ${offset ? styles.offset : ""}`}
      onClick={onClickContainer}
    >
      <div className={`${styles.empty} ${!offset ? styles.hide : ""}`}>
        <svg
          width="705"
          height="48"
          viewBox="0 0 705 141"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 30.614C0 23.2712 5.87626 17.3187 13.125 17.3187C20.3737 17.3187 26.25 23.2712 26.25 30.614V110.386C26.25 117.729 20.3737 123.681 13.125 123.681C5.87626 123.681 0 117.729 0 110.386V30.614Z"
            fill="white"
          />
          <path
            d="M99.75 30.614C99.75 23.2712 105.626 17.3187 112.875 17.3187C120.124 17.3187 126 23.2712 126 30.614V110.386C126 117.729 120.124 123.681 112.875 123.681C105.626 123.681 99.75 117.729 99.75 110.386V30.614Z"
            fill="white"
          />
          <path
            d="M94.5 70.5C94.5 88.1227 80.397 102.409 63 102.409C45.603 102.409 31.5 88.1227 31.5 70.5C31.5 52.8773 45.603 38.5912 63 38.5912C80.397 38.5912 94.5 52.8773 94.5 70.5Z"
            fill="white"
          />
          <path
            d="M241.08 75.48H199.08V114H184.5V27.24H199.08V63.06H241.08V27.24H255.66V114H241.08V75.48ZM289.449 51.96V114H275.409V51.96H289.449ZM289.629 27.3V41.1H275.169V27.3H289.629ZM334.273 134.52C323.833 134.52 315.813 133.12 310.213 130.32C304.613 127.52 301.813 123.68 301.813 118.8C301.813 116.6 302.353 114.76 303.433 113.28C304.513 111.8 305.793 110.58 307.273 109.62C308.753 108.66 310.113 107.92 311.353 107.4C312.593 106.88 313.393 106.5 313.753 106.26C313.073 105.86 312.173 105.34 311.053 104.7C309.933 104.06 308.913 103.18 307.993 102.06C307.113 100.94 306.673 99.48 306.673 97.68C306.673 95.6 307.653 93.68 309.613 91.92C311.613 90.16 314.593 88.9 318.553 88.14C314.673 86.26 311.693 83.72 309.613 80.52C307.533 77.32 306.493 74 306.493 70.56C306.493 66.48 307.673 62.98 310.033 60.06C312.433 57.14 315.753 54.9 319.993 53.34C324.273 51.78 329.213 51 334.813 51C338.973 51 342.413 51.46 345.133 52.38C347.853 53.3 350.393 54.54 352.753 56.1C353.553 55.78 354.673 55.34 356.113 54.78C357.593 54.18 359.193 53.54 360.913 52.86C362.633 52.14 364.273 51.46 365.833 50.82C367.433 50.14 368.793 49.58 369.913 49.14L369.793 61.2L359.053 63.12C359.573 64.28 359.973 65.54 360.253 66.9C360.573 68.26 360.733 69.46 360.733 70.5C360.733 74.1 359.713 77.44 357.673 80.52C355.673 83.56 352.653 86 348.613 87.84C344.613 89.68 339.613 90.6 333.613 90.6C333.013 90.6 332.193 90.58 331.153 90.54C330.113 90.5 329.273 90.46 328.633 90.42C325.393 90.54 323.173 90.92 321.973 91.56C320.773 92.2 320.173 92.9 320.173 93.66C320.173 94.74 321.073 95.46 322.873 95.82C324.673 96.18 327.553 96.5 331.513 96.78C332.913 96.86 334.753 96.96 337.033 97.08C339.313 97.2 341.853 97.36 344.653 97.56C351.733 98 357.093 99.78 360.733 102.9C364.373 105.98 366.193 109.98 366.193 114.9C366.193 120.62 363.553 125.32 358.273 129C352.993 132.68 344.993 134.52 334.273 134.52ZM336.733 125.94C341.973 125.94 345.853 125.22 348.373 123.78C350.893 122.34 352.153 120.22 352.153 117.42C352.153 115.26 351.293 113.5 349.573 112.14C347.853 110.78 345.293 109.98 341.893 109.74L326.233 108.78C324.513 108.66 322.873 108.98 321.313 109.74C319.793 110.46 318.553 111.48 317.593 112.8C316.633 114.08 316.153 115.5 316.153 117.06C316.153 119.98 317.833 122.18 321.193 123.66C324.553 125.18 329.733 125.94 336.733 125.94ZM334.093 82.02C337.893 82.02 340.973 81.06 343.333 79.14C345.693 77.18 346.873 74.42 346.873 70.86C346.873 67.18 345.693 64.32 343.333 62.28C340.973 60.2 337.893 59.16 334.093 59.16C330.213 59.16 327.073 60.2 324.673 62.28C322.313 64.36 321.133 67.22 321.133 70.86C321.133 74.3 322.273 77.02 324.553 79.02C326.833 81.02 330.013 82.02 334.093 82.02ZM381.616 114V24.84H396.016V60.96C397.016 59.4 398.336 57.9 399.976 56.46C401.616 54.98 403.616 53.78 405.976 52.86C408.376 51.9 411.236 51.42 414.556 51.42C418.516 51.42 422.136 52.18 425.416 53.7C428.696 55.22 431.316 57.42 433.276 60.3C435.236 63.14 436.216 66.54 436.216 70.5V114H421.576V72.96C421.576 69.76 420.436 67.28 418.156 65.52C415.916 63.76 413.076 62.88 409.636 62.88C407.356 62.88 405.176 63.28 403.096 64.08C401.016 64.88 399.336 66.08 398.056 67.68C396.816 69.24 396.196 71.2 396.196 73.56V114H381.616ZM469.691 114.9C465.691 114.9 462.491 114.4 460.091 113.4C457.691 112.4 455.891 111.06 454.691 109.38C453.491 107.7 452.711 105.82 452.351 103.74C451.991 101.62 451.811 99.46 451.811 97.26V24.84H466.091V95.58C466.091 98.26 466.631 100.34 467.711 101.82C468.831 103.3 470.631 104.16 473.111 104.4L476.231 104.52V113.7C475.151 114.02 474.051 114.3 472.931 114.54C471.811 114.78 470.731 114.9 469.691 114.9ZM504.02 51.96V114H489.98V51.96H504.02ZM504.2 27.3V41.1H489.74V27.3H504.2ZM548.843 134.52C538.403 134.52 530.383 133.12 524.783 130.32C519.183 127.52 516.383 123.68 516.383 118.8C516.383 116.6 516.923 114.76 518.003 113.28C519.083 111.8 520.363 110.58 521.843 109.62C523.323 108.66 524.683 107.92 525.923 107.4C527.163 106.88 527.963 106.5 528.323 106.26C527.643 105.86 526.743 105.34 525.623 104.7C524.503 104.06 523.483 103.18 522.563 102.06C521.683 100.94 521.243 99.48 521.243 97.68C521.243 95.6 522.223 93.68 524.183 91.92C526.183 90.16 529.163 88.9 533.123 88.14C529.243 86.26 526.263 83.72 524.183 80.52C522.103 77.32 521.063 74 521.063 70.56C521.063 66.48 522.243 62.98 524.603 60.06C527.003 57.14 530.323 54.9 534.563 53.34C538.843 51.78 543.783 51 549.383 51C553.543 51 556.983 51.46 559.703 52.38C562.423 53.3 564.963 54.54 567.323 56.1C568.123 55.78 569.243 55.34 570.683 54.78C572.163 54.18 573.763 53.54 575.483 52.86C577.203 52.14 578.843 51.46 580.403 50.82C582.003 50.14 583.363 49.58 584.483 49.14L584.363 61.2L573.623 63.12C574.143 64.28 574.543 65.54 574.823 66.9C575.143 68.26 575.303 69.46 575.303 70.5C575.303 74.1 574.283 77.44 572.243 80.52C570.243 83.56 567.223 86 563.183 87.84C559.183 89.68 554.183 90.6 548.183 90.6C547.583 90.6 546.763 90.58 545.723 90.54C544.683 90.5 543.843 90.46 543.203 90.42C539.963 90.54 537.743 90.92 536.543 91.56C535.343 92.2 534.743 92.9 534.743 93.66C534.743 94.74 535.643 95.46 537.443 95.82C539.243 96.18 542.123 96.5 546.083 96.78C547.483 96.86 549.323 96.96 551.603 97.08C553.883 97.2 556.423 97.36 559.223 97.56C566.303 98 571.663 99.78 575.303 102.9C578.943 105.98 580.763 109.98 580.763 114.9C580.763 120.62 578.123 125.32 572.843 129C567.563 132.68 559.563 134.52 548.843 134.52ZM551.303 125.94C556.543 125.94 560.423 125.22 562.943 123.78C565.463 122.34 566.723 120.22 566.723 117.42C566.723 115.26 565.863 113.5 564.143 112.14C562.423 110.78 559.863 109.98 556.463 109.74L540.803 108.78C539.083 108.66 537.443 108.98 535.883 109.74C534.363 110.46 533.123 111.48 532.163 112.8C531.203 114.08 530.723 115.5 530.723 117.06C530.723 119.98 532.403 122.18 535.763 123.66C539.123 125.18 544.303 125.94 551.303 125.94ZM548.663 82.02C552.463 82.02 555.543 81.06 557.903 79.14C560.263 77.18 561.443 74.42 561.443 70.86C561.443 67.18 560.263 64.32 557.903 62.28C555.543 60.2 552.463 59.16 548.663 59.16C544.783 59.16 541.643 60.2 539.243 62.28C536.883 64.36 535.703 67.22 535.703 70.86C535.703 74.3 536.843 77.02 539.123 79.02C541.403 81.02 544.583 82.02 548.663 82.02ZM596.186 114V24.84H610.586V60.96C611.586 59.4 612.906 57.9 614.546 56.46C616.186 54.98 618.186 53.78 620.546 52.86C622.946 51.9 625.806 51.42 629.126 51.42C633.086 51.42 636.706 52.18 639.986 53.7C643.266 55.22 645.886 57.42 647.846 60.3C649.806 63.14 650.786 66.54 650.786 70.5V114H636.146V72.96C636.146 69.76 635.006 67.28 632.726 65.52C630.486 63.76 627.646 62.88 624.206 62.88C621.926 62.88 619.746 63.28 617.666 64.08C615.586 64.88 613.906 66.08 612.626 67.68C611.386 69.24 610.766 71.2 610.766 73.56V114H596.186ZM698.498 62.28H684.638L684.698 97.86C684.698 99.7 684.898 101.06 685.298 101.94C685.738 102.78 686.418 103.34 687.338 103.62C688.298 103.86 689.578 103.98 691.178 103.98H698.798V113.22C697.998 113.54 696.778 113.82 695.138 114.06C693.538 114.34 691.378 114.48 688.658 114.48C683.738 114.48 679.918 113.84 677.198 112.56C674.518 111.24 672.658 109.38 671.618 106.98C670.578 104.58 670.058 101.72 670.058 98.4V62.28H659.978V51.96H670.478L674.138 33.54H684.638V51.9H698.498V62.28Z"
            fill="white"
          />
        </svg>
      </div>
      {attachments.length > 0 && (
        <div className="flex gap-2">
          {attachments.map((attachment: AttachmentType, index: number) => (
            <Attachment
              type={attachment.type}
              value={
                attachment.type === "pdf"
                  ? attachment.value.name
                  : attachment.value
              }
              removeEnabled
              key={index}
            />
          ))}
        </div>
      )}
      <div className={styles.attachmentsButtonContainer}>
        <AttachmentsButton />
      </div>
      <textarea
        ref={inputRef}
        autoFocus={true}
        placeholder={PLACEHOLDER_TEXT}
        value={input}
        rows={1}
        onInput={(e) => setInput(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
