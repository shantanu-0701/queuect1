"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobState = void 0;
/**
 * Job state enumeration
 */
var JobState;
(function (JobState) {
    JobState["PENDING"] = "pending";
    JobState["PROCESSING"] = "processing";
    JobState["COMPLETED"] = "completed";
    JobState["FAILED"] = "failed";
    JobState["DEAD"] = "dead";
})(JobState || (exports.JobState = JobState = {}));
//# sourceMappingURL=job.js.map