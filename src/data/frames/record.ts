import { format as formatDate } from "date-and-time";
import { customAlphabet } from "nanoid";
import { Ok, Err, Result } from "ts-results";
import chalk from "chalk";
import { createFile } from "../file";
import { createFrame, Frame, FrameData } from "./frame";
import { MAX_FRAME_DURATION } from ".";

type FrameDataBlueprint = Omit<FrameData, "localID">;

const createRandomID = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  4
);

function findOverlappingFrame(
  blueprint: FrameDataBlueprint,
  frames: FrameData[]
): FrameData | null {
  for (const frame of frames) {
    if (
      (blueprint.start > frame.start && blueprint.start < frame.end) ||
      (blueprint.end > frame.start && blueprint.end < frame.end)
    )
      return frame;
  }
  return null;
}

export async function recordFrame(
  blueprint: FrameDataBlueprint
): Promise<Result<Frame, string>> {
  if (blueprint.end - blueprint.start > MAX_FRAME_DURATION)
    return new Err(
      `The new frame has a duration of over 4 weeks and thus cannot be recorded.
Run ${chalk.bold("hocus cancel")} to stop the current session without saving.`
    );

  const fileName = `${formatDate(
    new Date(1000 * blueprint.start),
    "YYYY-MM"
  )}.json`;
  const file = createFile<FrameData[]>(fileName);

  const frames = (await file.load()) || [];
  const blockingFrame = findOverlappingFrame(blueprint, frames);
  if (blockingFrame)
    return new Err(
      `New frame overlaps with frame ${chalk.bold(
        createFrame(blockingFrame).id
      )} and thus cannot be added`
    );

  let localID: string;
  do {
    localID = createRandomID();
  } while (frames.find((frame) => frame.localID === localID));

  const frameData: FrameData = {
    ...blueprint,
    localID,
  };
  frames.push(frameData);

  file.store(
    frames.sort((a, b) => a.start - b.start),
    true
  );

  return new Ok(createFrame(frameData));
}
