import * as QuestionTypeService from './QuestionType.Service';
import * as QuestionBankService from './QuestionBank.Service';
import * as HardStatusTypeService from './HardStatusType.Service';
import * as SoftStatusTypeService from './SoftStatusType.Service';
import * as ApplicationVersionService from './ApplicationVersion.Service';
import * as ApplicationVersionCustomQuestionService from './ApplicationVersionCustomQuestion.Service';
import * as QuestionBankMultipleChoiceAnswersService from './QuestionBankMultipleChoiceAnswers.Service';
import * as JobPostingService from './JobPosting.Service';

const questionTypeService = QuestionTypeService;
const questionBankService = QuestionBankService;
const hardStatusTypeService = HardStatusTypeService;
const softStatusTypeService = SoftStatusTypeService;
const applicationVersionService = ApplicationVersionService;
const applicationVersionCustomQuestionService = ApplicationVersionCustomQuestionService;
const questionBankMultipleChoiceAnswersService = QuestionBankMultipleChoiceAnswersService;
const jobPostingService = JobPostingService;

export { 
    questionTypeService,
    questionBankService,
    hardStatusTypeService,
    softStatusTypeService,
    applicationVersionService,
    applicationVersionCustomQuestionService,
    questionBankMultipleChoiceAnswersService,
    jobPostingService,
};
