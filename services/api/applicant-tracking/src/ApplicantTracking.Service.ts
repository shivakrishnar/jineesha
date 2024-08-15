import * as QuestionTypeService from './QuestionType.Service';
import * as QuestionBankService from './QuestionBank.Service';
import * as HardStatusTypeService from './HardStatusType.Service';
import * as SoftStatusTypeService from './SoftStatusType.Service';
import * as ApplicationVersionService from './ApplicationVersion.Service';
import * as ApplicationVersionCustomQuestionService from './ApplicationVersionCustomQuestion.Service';
import * as QuestionBankMultipleChoiceAnswersService from './QuestionBankMultipleChoiceAnswers.Service';
import * as JobPostingService from './JobPosting.Service';
import * as JobPostingResponsibleUserService from './JobPostingResponsibleUser.Service';
import * as ApplicationService from './Application.Service';
import * as ApplicationQuestionBankAnswerService from './ApplicationQuestionBankAnswer.Service';
import * as ApplicationNoteService from './ApplicationNote.Service';
import * as ApplicationStatusHistoryService from './ApplicationStatusHistory.Service';
import * as QuestionBankGroupService from './QuestionBankGroup.Service';
import * as SystemsService from './Systems.Service';
import * as RolesService from './Roles.Service';

const questionTypeService = QuestionTypeService;
const questionBankService = QuestionBankService;
const hardStatusTypeService = HardStatusTypeService;
const softStatusTypeService = SoftStatusTypeService;
const applicationVersionService = ApplicationVersionService;
const applicationVersionCustomQuestionService = ApplicationVersionCustomQuestionService;
const questionBankMultipleChoiceAnswersService = QuestionBankMultipleChoiceAnswersService;
const jobPostingService = JobPostingService;
const jobPostingResponsibleUserService = JobPostingResponsibleUserService;
const applicationService = ApplicationService;
const applicationQuestionBankAnswerService = ApplicationQuestionBankAnswerService;
const applicationNoteService = ApplicationNoteService;
const applicationStatusHistoryService = ApplicationStatusHistoryService;
const questionBankGroupService = QuestionBankGroupService;
const systemsService = SystemsService;
const rolesService = RolesService;

export { 
    questionTypeService,
    questionBankService,
    hardStatusTypeService,
    softStatusTypeService,
    applicationVersionService,
    applicationVersionCustomQuestionService,
    questionBankMultipleChoiceAnswersService,
    jobPostingService,
    jobPostingResponsibleUserService,
    applicationService,
    applicationQuestionBankAnswerService,
    applicationNoteService,
    applicationStatusHistoryService,
    questionBankGroupService,
    systemsService,
    rolesService,
};
