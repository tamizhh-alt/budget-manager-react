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
  const { 
    register, 
    handleSubmit, 
    setValue, 
    formState: { errors }, 
    setError, 
    reset, 
    control 
  } = useForm({
    resolver: yupResolver(addExpenseValidationSchema),
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

  // Add user safety check
  const user = state?.user;
  
  if (!user) {
    return (
      <div>
        <Helmet title="Dashboard" />
        <div className="p-grid p-nogutter p-align-center p-justify-center" style={{ height: "50vh" }}>
          <div className="p-col-12 text-center">
            <h3>Loading dashboard...</h3>
          </div>
        </div>
      </div>
    );
  }

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
      if (response.data?.data && Array.isArray(response.data.data)) {
        setExpenseCategories(response.data.data);
      }
    } catch (error) {
      console.log(error);
      setExpenseCategories([]);
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
      setMonthlyExpenseSummary({});
    }
  };

  const requestIncomeSummary = async () => {
    try {
      const response = await axios.get(reportApiEndpoints.monthlyIncomeSummary);
      setMonthlyIncomeSummary(response.data.data || {});
    } catch (error) {
      console.log(error);
      setMonthlyIncomeSummary({});
    }
  };

  const requestExpense = async () => {
    try {
      const response = await axios.get(
        expenseApiEndpoints.expense + "?per_page=5&sort_order=desc"
      );
      setRecentExpense({
        expense: response.data?.data || [],
        expenseLoading: false,
      });
    } catch (error) {
      console.log("error", error);
      setRecentExpense({ ...recentExpense, expenseLoading: false });
        expense: [], 
      };
  }

  const requestIncome = async () => {
    try {
      const response = await axios.get(
        incomeApiEndpoints.income + "?per_page=5&sort_order=desc"
      );
      setRecentIncome({
        income: response.data?.data || [],
        incomeLoading: false,
      });
    } catch (error) {
      console.log("error", error);
      setRecentIncome({ ...recentIncome, incomeLoading: false });
        income: [], 
      };
  }

  const submitExpense = (data) => {
    if (!data.category?.id) {
      messages.show({
        severity: "error",
        detail: "Please select a category",
        sticky: true,
      });
      return;
    }

    if (!state.currentCurrency?.id) {
      messages.show({
        severity: "error",
        detail: "Please select a currency",
        sticky: true,
      });
      return;
    }

    const submitData = {
      ...data,
      category_id: data.category.id,
      currency_id: state.currentCurrency.id,
      expense_date: dayjs(data.expense_date).format("YYYY-MM-DD HH:mm:ss"),
    };

    axios
      .post(expenseApiEndpoints.expense, JSON.stringify(submitData))
      .then((response) => {
        if (response.status === 201) {
          reset();
          setSubmitting(false);
          setValue(
            "expense_date",
            dayjs(response.data?.request?.expense_date || new Date()).toDate()
          );
          requestExpense();
          requestExpenseSummary();

          messages.show({
            severity: "success",
            detail: `Your expense on ${response.data?.request?.spent_on || 'item'} added.`,
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
          let validationErrors = Object.entries(error.response.data || {}).map(
            ([key, value]) => {
              return { name: key, message: Array.isArray(value) ? value[0] : value };
            }
          );
          validationErrors.forEach(err => {
            setError(err.name, { message: err.message });
          });
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
    if (!data) {
      return (
        <div>
          <div className="text-center">No transaction data found.</div>
          <hr />
        </div>
      );
    }
    
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item, index) => (
        <div key={index}>
          <div className="color-link text-center">
            {(item.total || 0).toLocaleString()}{" "}
            <span className="color-title">{item.currency_code || 'USD'}.</span>
          </div>
          <hr />
        </div>
      ));
    }
    if (typeof data === "object" && Object.keys(data).length > 0) {
      return Object.values(data).map((item, index) => (
        <div key={index}>
          <div className="color-link text-center">
            {(item.total || 0).toLocaleString()}{" "}
            <span className="color-title">{item.currency_code || 'USD'}.</span>
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
      
      <div className="p-grid">
        <div className="p-col-12">
          <div className="p-fluid">
            <div className="p-grid">
              <div className="p-col-6">
                <div className="p-panel p-component">
                  <div className="p-panel-titlebar">
                    <span className="color-title text-bold">Expense This Month</span>
                  </div>
                  <div className="p-panel-content-wrapper p-panel-content-wrapper-expanded">
                    <div className="p-panel-content">
                      {renderSummary(monthlyExpenseSummary.expense_month)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-col-6">
                <div className="p-panel p-component">
                  <div className="p-panel-titlebar">
                    <span className="color-title text-bold">Income This Month</span>
                  </div>
                  <div className="p-panel-content-wrapper p-panel-content-wrapper-expanded">
                    <div className="p-panel-content">
                      {renderSummary(monthlyIncomeSummary.income_month)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-grid">
        <div className="p-col-12 p-md-6">
          <div className="p-card">
            <div className="p-card-title">Recent Expenses</div>
            <div className="p-card-subtitle">Your latest expense transactions</div>
            <div className="p-card-content">
              {renderRecentExpense()}
            </div>
          </div>
        </div>
        
        <div className="p-col-12 p-md-6">
          <div className="p-card">
            <div className="p-card-title">Recent Income</div>
            <div className="p-card-subtitle">Your latest income transactions</div>
            <div className="p-card-content">
              {renderRecentIncome()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
