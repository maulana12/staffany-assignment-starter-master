import React, { FunctionComponent, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import { getErrorMessage } from "../helper/error/index";
import { deleteShiftById, getShiftsPerWeek, updateShiftById } from "../helper/api/shift";
import DataTable from "react-data-table-component";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { useHistory } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "@material-ui/lab/Alert";
import { Link as RouterLink } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import { format, set } from "date-fns";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { Button, Typography } from "@material-ui/core";
import { setTimeout } from "timers";

function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}
var activatePublishBtn: boolean = false;
var nextDate = 0;
var colorElement: string = "black";
var weekPublishTimeText:string;
const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },

  blue_color: {
    color: "blue",
  },

  fab: {
    position: "absolute",
    bottom: 40,
    right: 40,
    backgroundColor: 'white',
    color: theme.color.turquoise,
  },

  weekDate: {
    backgroundColor: theme.color.turqouise,
    color: "blue",
    marginLeft: "auto",
  },

  publishBtn: {
    backgroundColor: theme.color.turqouise,
    color: "white",
    marginLeft: "auto",
  },


}));

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
}
const ActionButton: FunctionComponent<ActionButtonProps> = ({
  id,
  onDelete,

}) => {
  return (
    <div >
      <IconButton
        size="small"
        aria-label="delete"
        component={RouterLink}
        to={`/shift/${id}/edit`}
        disabled={!activatePublishBtn}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton disabled={!activatePublishBtn} size="small" aria-label="delete" onClick={() => onDelete()}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

const Shift = () => {
  const classes = useStyles();
  const history = useHistory();
 
  var fromDateWeekView = new Date();
  var toDateWeekView = new Date();
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [firstDtinWeekStr, setFirstDtInWeekStr] = useState<string | null>(null);
  const [lastDtinWeekStr, setLastDtInWeekStr] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // const [listShift, setListsShift] = useState;

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onPublishClick = () => {

    setShowPublishConfirm(true);
    if (!showPublishConfirm) {
      updateShiftThatPublish();
      updateWeekView();
    }
    setShowPublishConfirm(false);
  };


  const onClosePublishClick = () => {
    setShowPublishConfirm(false);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  useEffect(() => {

    const getData = async () => {
      try {
        setIsLoading(true);
        setErrMsg("");
        const { results } = await getShiftsPerWeek(fromDateWeekView, toDateWeekView);


        setRows(results);
      } catch (error) {
        const message = getErrorMessage(error);
        setErrMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    getData();

    updateWeekView();
  }, []);

  const columns = [
    {
      name: "Name",
      selector: "name",
      sortable: true,
    },
    {
      name: "Date",
      selector: "date",
      sortable: true,
    },
    {
      name: "Start Time",
      selector: "startTime",
      sortable: true,
    },
    {
      name: "End Time",
      selector: "endTime",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <ActionButton id={row.id} onDelete={() => onDeleteClick(row.id)} />
      ),
    },
  ];


  const updateShiftThatPublish = async () => {
    var tempActvBtn: boolean = false;
    try {
      setIsLoading(true);
      setErrMsg("");
    
      for (var val of rows) {

        var id: string = val.id;
        const startTimeTemp = new Date().toUTCString();
        const payload = {
          name: val.name,
          date: val.date,
          startTime: val.startTime,
          endTime: val.endTime,
          isPublish: "Y",
        };

        if (id) {
          const { results } = await updateShiftById(id, payload);
          console.log(results);
        }
        if (!tempActvBtn) {
          tempActvBtn = true;
          colorElement = "#50D9CD";
        }
      }
      activatePublishBtn = !tempActvBtn;

    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setIsLoading(false);
    }

  }

  const previousClick = () => {
    nextDate = nextDate - 7;
    updateWeekView()
  };

  const nextClick = () => {
    nextDate = nextDate + 7;
    updateWeekView()
  };

  function isWeekAlreadyPublishMethod(data: any[]) {
    var actvPublishBtn = false;
    colorElement = "black";
   
    console.log(activatePublishBtn);
    for (var val of data) {
      var isPublish = val.isPublish;
      if (isPublish == "N") {
        actvPublishBtn = true;
        break;
      } else {
        weekPublishTimeText =  val.updatedAt;
        colorElement = "#50D9CD";
      }
    }
  
    activatePublishBtn = actvPublishBtn;
  }

  const updateWeekView = async () => {
    let wDate = new Date();
    let dDay = wDate.getDay() > 0 ? wDate.getDay() : 7;

    let first = wDate.getDate() - dDay + nextDate;
    let firstDayWeek = new Date(wDate.setDate(first));
    let lastDayWeek = new Date(wDate.setDate(firstDayWeek.getDate() + 6));

    setFirstDtInWeekStr(firstDayWeek.getUTCDate() + " " + firstDayWeek.toLocaleString('en-us', { month: 'long' }));
    setLastDtInWeekStr(lastDayWeek.getUTCDate() + " " + lastDayWeek.toLocaleString('en-us', { month: 'long' }));
    fromDateWeekView = firstDayWeek;
    toDateWeekView = lastDayWeek;
    const { results } = await getShiftsPerWeek(firstDayWeek, lastDayWeek);

    isWeekAlreadyPublishMethod(results);
    setRows(results);

  };

  function weekViewElement(colorFont: string) {
    var element = <b style={{ color: colorFont }}>{firstDtinWeekStr} - {lastDtinWeekStr}</b>;
    return element;
  }

  function displayUpdateAt() {
    var element;
    if(!activatePublishBtn && rows.length!=0)
    {
      element=<span> <CheckCircleOutlineIcon htmlColor="#50D9CD"/><span style={{ color: "#50D9CD"}}>Week published on {weekPublishTimeText}</span> </span>;
    }
    return element;
  }

  const deleteDataById = async () => {
    try {
      setDeleteLoading(true);
      setErrMsg("");

      if (selectedId === null) {
        throw new Error("ID is null");
      }

      console.log(deleteDataById);

      await deleteShiftById(selectedId);

      const tempRows = [...rows];
      const idx = tempRows.findIndex((v: any) => v.id === selectedId);
      tempRows.splice(idx, 1);
      setRows(tempRows);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setDeleteLoading(false);
      onCloseDeleteDialog();
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardContent>
            {errMsg.length > 0 ? (
              <Alert severity="error">{errMsg}</Alert>
            ) : (
              <></>
            )}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography >
                  <IconButton onClick={previousClick}>
                    <ChevronLeftIcon />
                  </IconButton>
                  {weekViewElement(colorElement)}

                  <IconButton >
                    <ChevronRightIcon onClick={nextClick} />
                  </IconButton>
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography >
                  {displayUpdateAt()}
                </Typography>
              </Grid>

              <Grid item xs={2}>
                <Button variant="contained"
                  disabled={!activatePublishBtn}
                  color="primary"
                  onClick={(e) => onPublishClick()}
                  className={classes.publishBtn}>Publish
                </Button>
              </Grid>

            </Grid>

            <DataTable
              title="Shifts"
              columns={columns}
              data={rows}
              pagination
              progressPending={isLoading}
            />

          </CardContent>
        </Card>
      </Grid>
      <Fab
        disabled={!activatePublishBtn && rows.length!=0}
        size="medium"
        aria-label="add"
        className={classes.fab}
        onClick={() => history.push("/shift/add")}
      >
        <AddIcon />
      </Fab>
      <ConfirmDialog
        title="Delete Confirmation"
        description={`Do you want to delete this data ?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteLoading}
      />
      <ConfirmDialog
        title="Publish Confirm"
        description={`Do you want to Publish this week shift ?`}
        onClose={onClosePublishClick}
        open={showPublishConfirm}
        onYes={onPublishClick}
        loading={isLoading}
      />

    </Grid>
  );
};

export default Shift;
