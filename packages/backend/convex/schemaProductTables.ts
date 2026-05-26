import { productContentTables } from "./schemaProductContentTables";
import { productIdentityTables } from "./schemaProductIdentityTables";
import { productNotificationTables } from "./schemaProductNotificationTables";
import { productReviewTables } from "./schemaProductReviewTables";

export const productSchemaTables = {
  ...productContentTables,
  ...productIdentityTables,
  ...productNotificationTables,
  ...productReviewTables,
};
