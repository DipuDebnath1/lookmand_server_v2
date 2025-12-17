/* eslint-disable @typescript-eslint/no-explicit-any */

import { Agenda } from 'agenda';
import { logger } from '../app/logger';
import { setupAgenda } from './ageda.config';

/**
 * Schedule or run an Agenda job immediately.
 *
 * @param jobName - The name of the Agenda job to run or schedule.
 * @param schedule - A date/time string or Date object indicating when to run the job.
 * @param data - Data object passed to the job.
 */
export const setAgendaSchedule = async (
  jobName: string,
  schedule: string | Date,
  data: Record<string, any>,
): Promise<void> => {
  try {
    const agenda: Agenda = await setupAgenda();

    const scheduleDate = new Date(schedule);

    if (scheduleDate <= new Date()) {
      // Run immediately if scheduled time is in the past
      await agenda.now(jobName, data);
      logger.info(`Job "${jobName}" executed immediately.`);
    } else {
      // Schedule for a future date
      await agenda.schedule(scheduleDate, jobName, data);
      logger.info(
        `Job "${jobName}" scheduled at ${scheduleDate.toISOString()}.`,
      );
    }
  } catch (error: any) {
    logger.error(`Error setting agenda schedule: ${error?.message}`);
  }
};
