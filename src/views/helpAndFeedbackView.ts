import { ExtensionContext } from "vscode";
import {
  HelpAndFeedbackView,
  Link,
  StandardLinksProvider,
  ProvideFeedbackLink,
  Command,
} from "vscode-ext-help-and-feedback-view";

export function registerHelpAndFeedbackView(context: ExtensionContext) {
  const items = new Array<Link | Command>();
  const predefinedProvider = new StandardLinksProvider("zjffun.toolboxes");
  items.push(predefinedProvider.getGetStartedLink());
  items.push(new ProvideFeedbackLink("toolboxes"));
  items.push(predefinedProvider.getReviewIssuesLink());
  items.push(predefinedProvider.getReportIssueLink());
  new HelpAndFeedbackView(
    context,
    "toolboxes-activitybarView-HelpAndFeedbackView",
    items
  );
}
