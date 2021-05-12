<template>
  <div class="admin-reports">
    <div class="filter-panel">
      <div class="col">
        <div class="filter-panel__row">
          <label for="joined-after" class="col">
            Joined after
            <input id="joined-after" type="date" v-model="joinedAfter" />
          </label>

          <label for="joined-before" class="col">
            Joined before
            <input id="joined-before" type="date" v-model="joinedBefore" />
          </label>
        </div>
      </div>

      <div class="col">
        <div class="filter-panel__row">
          <label for="session-range-from" class="col">
            Session from
            <input
              id="session-range-from"
              type="date"
              v-model="sessionRangeFrom"
            />
          </label>

          <label for="session-range-to" class="col">
            Session to
            <input id="session-range-to" type="date" v-model="sessionRangeTo" />
          </label>
        </div>
      </div>

      <div class="col">
        <div>
          <label for="student-partner-org" class="col">
            Student partner org
            <v-select
              id="student-partner-org"
              class="filter-panel__partner-select"
              :options="studentPartnerOrgs"
              label="displayName"
              v-model="studentPartnerOrg"
            />
          </label>
        </div>
        <div class="col" v-if="studentPartnerOrg && studentPartnerOrg.sites">
          <label for="partner-site">Partner Site</label>
          <v-select
            id="partner-sites"
            class="filter-panel__partner-select"
            :options="partnerSites"
            v-model="studentPartnerSite"
          />
        </div>
      </div>
      <div class="col">
        <div>
          <label for="high-school" class="col">
            High school
            <school-list
              class="filter-panel__high-school-list"
              :setHighSchool="setHighSchool"
              placeholder="Search for a school"
            />
          </label>
        </div>
      </div>
    </div>

    <p class="error">{{ error }}</p>
    <Loader v-if="isGeneratingReport" />

    <button
      type="button"
      class="report-btn"
      @click="generateSessionReport"
      :disabled="isGeneratingReport"
    >
      Generate Session Report
    </button>
    <button
      type="button"
      class="report-btn"
      @click="generateUsageReport"
      :disabled="isGeneratingReport"
    >
      Generate Usage Report
    </button>
  </div>
</template>

<script>
import NetworkService from '@/services/NetworkService'
import SchoolList from '@/components/SchoolList'
import Loader from '@/components/Loader'
import moment from 'moment'
import exportToCsv from '@/utils/export-to-csv'

export default {
  name: 'AdminReports',
  components: { SchoolList, Loader },

  data() {
    return {
      joinedBefore: '',
      joinedAfter: '',
      sessionRangeFrom: '',
      sessionRangeTo: '',
      highSchool: '',
      studentPartnerOrg: {},
      studentPartnerSite: '',
      error: '',
      isGeneratingReport: false,
      studentPartnerOrgs: []
    }
  },
  async mounted() {
    const {
      body: { partnerOrgs: studentPartnerOrgs }
    } = await NetworkService.adminGetStudentPartners()
    this.studentPartnerOrgs = studentPartnerOrgs
  },
  methods: {
    async generateSessionReport() {
      if (this.isGeneratingReport) return
      this.isGeneratingReport = true
      this.error = ''

      const query = this.getQuery()
      try {
        const {
          body: { sessions }
        } = await NetworkService.adminGetSessionReport(query)

        if (sessions.length === 0) this.error = 'No sessions meet the criteria'
        else
          exportToCsv(
            `${this.fileTitle}_Session_Report_${this.todaysDate}`,
            sessions
          )

        this.isGeneratingReport = false
      } catch (error) {
        this.errorHandler()
      }
    },

    async generateUsageReport() {
      if (this.isGeneratingReport) return
      this.isGeneratingReport = true
      this.error = ''

      const query = this.getQuery()
      try {
        const {
          body: { students }
        } = await NetworkService.adminGetUsageReport(query)
        if (students.length === 0) this.error = 'No students meet the criteria'
        else
          exportToCsv(
            `${this.fileTitle}_Usage_Report_${this.todaysDate}`,
            students
          )

        this.isGeneratingReport = false
      } catch (error) {
        this.errorHandler()
      }
    },
    setHighSchool(highSchool) {
      this.highSchool = highSchool
    },
    getQuery() {
      return {
        joinedBefore: this.joinedBefore,
        joinedAfter: this.joinedAfter,
        sessionRangeFrom: this.sessionRangeFrom,
        sessionRangeTo: this.sessionRangeTo,
        highSchoolId: this.highSchool._id ? this.highSchool._id : '',
        // partner org can be "null" from clearing the v-select, check for if exists and then get the partnerOrg
        studentPartnerOrg: this.isValidStudentPartnerOrg
          ? this.studentPartnerOrg.key
          : '',
        studentPartnerSite: this.isValidPartnerSite
          ? this.studentPartnerSite
          : ''
      }
    },
    errorHandler() {
      this.isGeneratingReport = false
      this.error = 'There was a problem with retrieving the report'
    }
  },
  computed: {
    todaysDate() {
      return moment().format('MMMM_D')
    },
    fileTitle() {
      let title = ''
      if (this.highSchool.name) title = this.highSchool.name
      if (this.studentPartnerOrg && this.studentPartnerOrg.displayName)
        title = this.studentPartnerOrg.displayName
      if (this.isValidPartnerSite) title = this.studentPartnerSite

      return title
    },
    partnerSites() {
      if (this.studentPartnerOrg && this.studentPartnerOrg.sites)
        return ['All sites', ...this.studentPartnerOrg.sites]
      return []
    },
    isValidPartnerSite() {
      return (
        this.studentPartnerOrg &&
        this.studentPartnerOrg.sites &&
        this.studentPartnerOrg.sites.includes(this.studentPartnerSite)
      )
    },
    isValidStudentPartnerOrg() {
      return this.studentPartnerOrg && this.studentPartnerOrg.key
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-reports {
  background: #fff;
  margin: 10px;
  padding: 10px;
  border-radius: 8px;

  @include breakpoint-above('medium') {
    margin: 40px;
    padding: 40px;
  }
}

input {
  min-width: 180px;
}

.filter-panel {
  @include flex-container(column, space-between, flex-start);
  flex-wrap: wrap;
  border-radius: 8px;

  &__row {
    @include flex-container(row);
  }

  &__session-range {
    @include flex-container(row);
  }

  &__partner-select,
  &__high-school-list {
    width: 400px;
  }
}

.col {
  @include flex-container(column, flex-start, flex-start);
  margin: 0.4em 0;
  padding-left: 0;
  @include breakpoint-above('medium') {
    margin-right: 10px;
  }
}

.report-btn {
  height: 60px;
  background-color: white;
  border: 1px solid $c-border-grey;
  font-size: 16px;
  font-weight: 600;
  color: $c-success-green;
  width: 250px;
  margin-bottom: 1em;
  display: block;

  &:hover {
    background-color: $c-success-green;
    color: white;
  }

  &:disabled {
    color: $c-background-grey;
    background-color: $c-secondary-grey;
  }
}

.error {
  color: $c-error-red;
  text-align: left;
  margin: 2em 0;
  font-size: 16px;
}
</style>
