import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import * as dayjs from "dayjs";

import { Messages } from "primereact/messages";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

import CurrencySidebar from "./../common/CurrencySidebar";
import ExpenseListItem from "./../expense/ExpenseListItem";
import IncomeListItem from "./../income/IncomeListItem";

import {
  expenseApiEndpoints,
  incomeApiEndpoints,
  reportApiEndpoints,
} from "./../../API";
import axios from "./../../Axios";
import { useTracked } from "./../../Store";

let messages;

const addExpenseValidationSchema = yup.object().shape({
  expense_date: yup.string().required("Expense date field is required"),
  category: yup.object().required("Expense category field is required"),
  amount: yup.string().required("Expense amount field is required"),
  spent_on: yup
    .string()
    .required("Spent on field is required")
    .max(100, "Spent on must be at most 100 characters"),
  remarks: yup.string().max(200, "Remarks must be at most 200 characters"),
});

const Dashboard = () => {
  const [state] = useTracked();
  const { register, handleSubmit, setValue, errors, setError, reset, control } =
    useForm({
      validationSchema: addExpenseValidationSchema,
    });
  const [submitting, setSubmitting] = useState(false);
  const [currencyVisible, setCurrencyVisible] = useState(false);
  const [recentExpense, setRecentExpense] = useState({
    expense: [],
    expenseLoading: true,
  });
  const [recentIncome, setRecentIncome] = useState({
    income: [],
    incomeLoading: true,
  });
  const [monthlyExpenseSummary, setMonthlyExpenseSummary] = useState({});
  const [monthlyIncomeSummary, setMonthlyIncomeSummary] = useState({});
  const [expenseCategories, setExpenseCategories] = useState([]);

  useEffect(() => {
    requestExpenseCategory();
    requestExpense();
    requestIncome();
    requestExpenseSummary();
    requestIncomeSummary();
  }, []);

  const requestExpenseCategory = async () => {
    try {
      const response = await axios.get(
        expenseApiEndpoints.expenseCategory +
          "?sort_col=category_name&sort_order=asc"
      );
      if (response.data?.data?.length > 0) {
        setExpenseCategories(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const requestExpenseSummary = async () => {
    try {
      const response = await axios.get(
        reportApiEndpoints.monthlyExpenseSummary
      );
      setMonthlyExpenseSummary(response.data.data || {});
    } catch (error) {
      console.log(error);
    }
  };

  const requestIncomeSummary = async () => {
    try {
      const response = await axios.get(reportApiEndpoints.monthlyIncomeSummary);
      setMonthlyIncomeSummary(response.data.data || {});
    } catch (error) {
      console.log(error);
    }
  };

  const requestExpense = async () => {
    try {
      const response = await axios.get(
        expenseApiEndpoints.expense + "?per_page=5&sort_order=desc"
      );
      setRecentExpense({
        expense: response.data.data || [],
        expenseLoading: false,
      });
    } catch (error) {
      console.log("error", error);
      setRecentExpense({ ...recentExpense, expenseLoading: false });
    }
  };

  const requestIncome = async () => {
    try {
      const response = await axios.get(
        incomeApiEndpoints.income + "?per_page=5&sort_order=desc"
      );
      setRecentIncome({
        income: response.data.data || [],
        incomeLoading: false,
      });
    } catch (error) {
      console.log("error", error);
      setRecentIncome({ ...recentIncome, incomeLoading: false });
    }
  };

  const submitExpense = (data) => {
    data.category_id = data.category.id;
    data.currency_id = state.currentCurrency?.id;
    data.expense_date = dayjs(data.expense_date).format("YYYY-MM-DD HH:mm:ss");

    axios
      .post(expenseApiEndpoints.expense, JSON.stringify(data))
      .then((response) => {
        if (response.status === 201) {
          reset();
          setSubmitting(false);
          setValue(
            "expense_date",
            dayjs(response.data.request.expense_date).toDate()
          );
          requestExpense();
          requestExpenseSummary();

          messages.show({
            severity: "success",
            detail: `Your expense on ${response.data.request.spent_on} added.`,
            sticky: false,
            closable: false,
            life: 5000,
          });
        }
      })
      .catch((error) => {
        console.log("error", error.response);
        if (error.response?.status === 401) {
          messages.clear();
          messages.show({
            severity: "error",
            detail: "Something went wrong. Try again.",
            sticky: true,
            closable: true,
            life: 5000,
          });
        } else if (error.response?.status === 422) {
          let errors = Object.entries(error.response.data).map(
            ([key, value]) => {
              return { name: key, message: value[0] };
            }
          );
          setError(errors);
        }
        setSubmitting(false);
      });
  };

  const renderRecentExpense = () => {
    if (recentExpense.expenseLoading) {
      return (
        <div className="p-grid p-nogutter p-justify-center">
          <ProgressSpinner style={{ height: "25px" }} strokeWidth={"4"} />
        </div>
      );
    }
    if (
      Array.isArray(recentExpense.expense) &&
      recentExpense.expense.length > 0
    ) {
      return recentExpense.expense.map((item) => (
        <ExpenseListItem key={item.id} itemDetail={item} />
      ));
    }
    return (
      <div className="p-grid p-nogutter p-justify-center">
        <h4 className="color-subtitle">Spend some cash to see recent.</h4>
      </div>
    );
  };

  const renderRecentIncome = () => {
    if (recentIncome.incomeLoading) {
      return (
        <div className="p-grid p-nogutter p-justify-center">
          <ProgressSpinner style={{ height: "25px" }} strokeWidth={"4"} />
        </div>
      );
    }
    if (Array.isArray(recentIncome.income) && recentIncome.income.length > 0) {
      return recentIncome.income.map((item) => (
        <IncomeListItem key={item.id} itemDetail={item} />
      ));
    }
    return (
      <div className="p-grid p-nogutter p-justify-center">
        <h4 className="color-subtitle">Add some earnings to see recent.</h4>
      </div>
    );
  };

  const renderSummary = (data) => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item, index) => (
        <div key={index}>
          <div className="color-link text-center">
            {item.total?.toLocaleString()}{" "}
            <span className="color-title">{item.currency_code}.</span>
          </div>
          <hr />
        </div>
      ));
    }
    if (typeof data === "object" && Object.keys(data).length > 0) {
      return Object.values(data).map((item, index) => (
        <div key={index}>
          <div className="color-link text-center">
            {item.total?.toLocaleString()}{" "}
            <span className="color-title">{item.currency_code}.</span>
          </div>
          <hr />
        </div>
      ));
    }
    return (
      <div>
        <div className="text-center">No transaction data found.</div>
        <hr />
      </div>
    );
  };

  return (
    <div>
      <Helmet title="Dashboard" />
      <CurrencySidebar
        visible={currencyVisible}
        onHide={() => setCurrencyVisible(false)}
      />
      <div className="p-grid p-nogutter">
        <div className="p-col-12">
          <Messages ref={(el) => (messages = el)} />
        </div>
      </div>
      {/* The rest of your JSX remains unchanged */}
    </div>
  );
};

export default React.memo(Dashboard);
